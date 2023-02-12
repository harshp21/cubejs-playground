import { Component } from 'react';
import {
  CopyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Card, SectionRow } from './components';
import styled from 'styled-components';
import { Redirect, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import PrismCode from './PrismCode';
import { copyToClipboard } from './utils';

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
    id: 'react',
    title: 'React',
    supported: true,
    scaffoldingSupported: true,
  }
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

      return {
        ...state,
        chartRendererError: null,
        dependencies: __cubejsPlayground.getDependencies(props.chartingLibrary),
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
      redirectToDashboard,
      showCode,
      chartRendererError,
    } = this.state;
    const {
      resultSet,
      error,
      render,
      hideActions,
      query,
      framework,
    } = this.props;

    if (redirectToDashboard) {
      return <Redirect to="/dashboard" />;
    }

    if (chartRendererError) {
      return <div>{chartRendererError}</div>;
    }

    const frameworkItem = frameworks.find((m) => m.id === framework);
    const extra = (
      <form
        action="https://codesandbox.io/api/v1/sandboxes/define"
        method="POST"
        target="_blank"
      >
        <SectionRow>
          <Button.Group>
            <Button
              onClick={() => {
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
              onClick={() => {}}
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
  hideActions: PropTypes.array,
  query: PropTypes.object,
  history: PropTypes.object.isRequired,
  chartingLibrary: PropTypes.string.isRequired,
};

ChartContainer.defaultProps = {
  query: {},
  hideActions: null,
  codeSandboxSource: null,
  error: null,
  resultSet: null,
};

export default withRouter(ChartContainer);
