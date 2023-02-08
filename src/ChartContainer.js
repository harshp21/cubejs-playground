import { Component } from 'react';
import {
  CodeOutlined,
  CodeSandboxOutlined,
  CopyOutlined,
  DownOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Dropdown, Menu, Modal } from 'antd';
import { Button, Card, SectionRow } from './components';
import { getParameters } from 'codesandbox-import-utils/lib/api/define';
import styled from 'styled-components';
import { Redirect, withRouter } from 'react-router-dom';
import { QueryRenderer } from '@cubejs-client/react';
import sqlFormatter from 'sql-formatter';
import PropTypes from 'prop-types';
import PrismCode from './PrismCode';
import CachePane from './components/CachePane';
import { playgroundAction } from './events';
import { codeSandboxDefinition, copyToClipboard } from './utils';

const frameworkToTemplate = {
  react: 'create-react-app',
  angular: 'angular-cli',
  vue: 'vue-cli',
};

const StyledCard = styled(Card)`
  .ant-card-head {
    position: sticky;
    top: 0;
    z-index: 100;
    background: white;
  }

  .ant-card-body {
    max-width: 100%;
    overflow: auto;
  }
`;

export const frameworks = [
  {
    id: 'vanilla',
    title: 'Vanilla JavaScript',
    docsLink: 'https://cube.dev/docs/@cubejs-client-core',
  },
  {
    id: 'react',
    title: 'React',
    supported: true,
    scaffoldingSupported: true,
  },
  {
    id: 'angular',
    title: 'Angular',
    supported: true,
    scaffoldingSupported: true,
  },
  {
    id: 'vue',
    title: 'Vue.js',
    docsLink: 'https://cube.dev/docs/@cubejs-client-vue',
  },
];

class ChartContainer extends Component {
  static getDerivedStateFromProps(props, state) {
    if (
      props.isChartRendererReady &&
      props.iframeRef.current != null &&
      props.chartingLibrary
    ) {
      const { __cubejsPlayground } = props.iframeRef.current.contentWindow;

      if (!__cubejsPlayground) {
        return {
          ...state,
          chartRendererError: 'The chart renderer failed to load',
        };
      }

      const codesandboxFiles = __cubejsPlayground.getCodesandboxFiles(
        props.chartingLibrary,
        {
          chartType: props.chartType,
          query: JSON.stringify(props.query, null, 2),
          pivotConfig: JSON.stringify(props.pivotConfig, null, 2),
          apiUrl: props.apiUrl,
          cubejsToken: props.cubejsToken,
        }
      );
      let codeExample = '';

      if (props.framework === 'react') {
        codeExample = codesandboxFiles['index.js'];
      } else if (props.framework === 'angular') {
        codeExample =
          codesandboxFiles[
            'src/app/query-renderer/query-renderer.component.ts'
          ];
      }

      return {
        ...state,
        chartRendererError: null,
        dependencies: __cubejsPlayground.getDependencies(props.chartingLibrary),
        codeExample,
        codesandboxFiles,
      };
    }
    return state;
  }

  constructor(props) {
    super(props);
    this.state = {
      showCode: false,
      chartRendererError: null,
    };
  }

  render() {
    const {
      codeExample,
      codesandboxFiles,
      dependencies,
      redirectToDashboard,
      showCode,
      addingToDashboard,
      chartRendererError,
    } = this.state;
    const {
      isChartRendererReady,
      resultSet,
      error,
      render,
      dashboardSource,
      hideActions,
      query,
      chartingLibrary,
      setChartLibrary,
      chartLibraries,
      history,
      framework,
      setFramework,
      onChartRendererReadyChange,
    } = this.props;

    if (redirectToDashboard) {
      return <Redirect to="/dashboard" />;
    }

    if (chartRendererError) {
      return <div>{chartRendererError}</div>;
    }

    const parameters = isChartRendererReady
      ? getParameters(
          codeSandboxDefinition(
            frameworkToTemplate[framework],
            codesandboxFiles,
            dependencies
          )
        )
      : null;

    const chartLibrariesMenu =
      (chartLibraries[framework] || []).length > 0 ? (
        <Menu
          onClick={(e) => {
            playgroundAction('Set Chart Library', { chartingLibrary: e.key });
            setChartLibrary(e.key);
          }}
        >
          {(chartLibraries[framework] || []).map((library) => (
            <Menu.Item key={library.value}>{library.title}</Menu.Item>
          ))}
        </Menu>
      ) : null;

    const frameworkMenu = (
      <Menu
        onClick={(e) => {
          playgroundAction('Set Framework', { framework: e.key });
          setFramework(e.key);
          onChartRendererReadyChange(false);
          setChartLibrary(chartLibraries[e.key]?.[0]?.value || null);
        }}
      >
        {frameworks.map((f) => (
          <Menu.Item key={f.id}>{f.title}</Menu.Item>
        ))}
      </Menu>
    );

    const currentLibraryItem = (chartLibraries[framework] || []).find(
      (m) => m.value === chartingLibrary
    );

    const frameworkItem = frameworks.find((m) => m.id === framework);
    const extra = (
      <form
        action="https://codesandbox.io/api/v1/sandboxes/define"
        method="POST"
        target="_blank"
      >
        {parameters != null ? (
          <input type="hidden" name="parameters" value={parameters} />
        ) : null}
        <SectionRow>
          <Button.Group>
            <Dropdown overlay={frameworkMenu}>
              <Button size="small">
                {frameworkItem?.title}
                <DownOutlined />
              </Button>
            </Dropdown>
            {chartLibrariesMenu ? (
              <Dropdown
                overlay={chartLibrariesMenu}
                disabled={!frameworkItem.supported}
              >
                <Button size="small">
                  {currentLibraryItem?.title}
                  <DownOutlined />
                </Button>
              </Dropdown>
            ) : null}
          </Button.Group>
          <Button.Group>
            <Button
              onClick={() => {
                playgroundAction('Show Chart');
                this.setState({
                  showCode: null,
                });
              }}
              size="small"
              type={!showCode ? 'primary' : 'default'}
              disabled={!frameworkItem.supported}
            >
              Chart
            </Button>
            <Button
              onClick={() => {
                playgroundAction('Show Query');
                this.setState({
                  showCode: 'query',
                });
              }}
              icon={<ThunderboltOutlined />}
              size="small"
              type={showCode === 'query' ? 'primary' : 'default'}
              disabled={!frameworkItem.supported}
            >
              JSON Query
            </Button>
          </Button.Group>
        </SectionRow>
      </form>
    );

    const queryText = JSON.stringify(query, null, 2);

    const renderChart = () => {
      if (!frameworkItem?.supported) {
        return (
          <h2 style={{ padding: 24, textAlign: 'center' }}>
            We do not support&nbsp;
            {frameworkItem.title}
            &nbsp;code generation here yet.
            <br />
            Please refer to&nbsp;
            <a
              href={frameworkItem.docsLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                playgroundAction('Unsupported Framework Docs', { framework })
              }
            >
              {frameworkItem.title}
              &nbsp;docs
            </a>
            &nbsp;to see on how to use it with Cube.js.
          </h2>
        );
      } else if (showCode === 'query') {
        return <PrismCode code={queryText} />;
      }
      return render({ framework, error });
    };

    let title;

   if (showCode === 'query') {
      title = (
        <SectionRow>
          <div>Query</div>
          <Button
            icon={<CopyOutlined />}
            size="small"
            onClick={() => {
              copyToClipboard(query);
              playgroundAction('Copy Query to Clipboard');
            }}
            type="primary"
          >
            Copy to Clipboard
          </Button>
        </SectionRow>
      );
    } else {
      title = 'Chart';
    }

    return hideActions ? (
      render({ resultSet, error })
    ) : (
      <StyledCard title={title} style={{ minHeight: 420 }} extra={extra}>
        {renderChart()}
      </StyledCard>
    );
  }
}

ChartContainer.propTypes = {
  resultSet: PropTypes.object,
  error: PropTypes.object,
  render: PropTypes.func.isRequired,
  codeSandboxSource: PropTypes.string,
  dashboardSource: PropTypes.object,
  hideActions: PropTypes.array,
  query: PropTypes.object,
  history: PropTypes.object.isRequired,
  chartingLibrary: PropTypes.string.isRequired,
  setChartLibrary: PropTypes.func.isRequired,
};

ChartContainer.defaultProps = {
  query: {},
  hideActions: null,
  dashboardSource: null,
  codeSandboxSource: null,
  error: null,
  resultSet: null,
};

export default withRouter(ChartContainer);
