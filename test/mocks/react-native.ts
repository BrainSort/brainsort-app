import React from 'react';

const createMockComponent = (displayName: string) => {
  const Component = (props: any) =>
    React.createElement(displayName, props, props.children);
  Component.displayName = displayName;
  return Component;
};

export const View = createMockComponent('View');
export const Text = createMockComponent('Text');
export const TouchableOpacity = createMockComponent('TouchableOpacity');
export const Modal = (props: any) =>
  props.visible === false
    ? null
    : React.createElement('Modal', props, props.children);

export const StyleSheet = {
  create: <T extends Record<string, any>>(styles: T): T => styles,
  flatten: (style: any) =>
    Array.isArray(style)
      ? Object.assign({}, ...style.filter(Boolean))
      : style || {},
};

export const Platform = {
  OS: 'web',
  select: (obj: Record<string, any>) => obj.web ?? obj.default,
};
