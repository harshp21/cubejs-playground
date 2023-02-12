import { useEffect } from 'react';
import styled from 'styled-components';

import { dispatchPlaygroundEvent } from '../../utils';

const ChartContainer = styled.div`
  visibility: ${(props) => (props.hidden ? 'hidden' : 'visible')};

  & > iframe {
    width: 100%;
    min-height: 400px;
    border: none;
  }
`;

export default function ChartRenderer({
  iframeRef,
  framework,
  isChartRendererReady,
  chartingLibrary,
  chartType,
  query,
  pivotConfig,
  onChartRendererReadyChange,
}) {

  useEffect(() => {
    return () => {
      onChartRendererReadyChange(false);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (isChartRendererReady && iframeRef.current) {
      dispatchPlaygroundEvent(iframeRef.current.contentDocument, 'chart', {
        pivotConfig,
        query,
        chartType,
        chartingLibrary,
      });
    }
    // eslint-disable-next-line
  }, [iframeRef, isChartRendererReady, pivotConfig, query, chartType]);

  return (
    <>
      <ChartContainer
        hidden={!isChartRendererReady}
      >
        <iframe
          ref={iframeRef}
          title="Chart renderer"
          src={`/chart-renderers/${framework}/index.html`}
        />
      </ChartContainer>
    </>
  );
}
