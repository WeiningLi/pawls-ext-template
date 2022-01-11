import React from 'react';
import { WidgetModel } from '@jupyter-widgets/base';
import { useModelState, WidgetModelContext } from './hooks/widget-model';
import { PDF } from './components';

interface WidgetProps {
  model: WidgetModel;
}

function ReactWidget(props: WidgetProps) {
  const [data, setName] = useModelState('value');
  console.log('prev', data);

  return (
    <div className="Widget">
      <h1 onChange={() => setName(data)}>Hello</h1>
      <PDF data={data} />
    </div>
  );
}

function withModelContext(Component: (props: WidgetProps) => JSX.Element) {
  return (props: WidgetProps) => (
    <WidgetModelContext.Provider value={props.model}>
      <Component {...props} />
    </WidgetModelContext.Provider>
  );
}

export default withModelContext(ReactWidget);
