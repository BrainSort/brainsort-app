import React from 'react';

const createSvgMock = (name: string) => {
  const Comp = (props: any) => React.createElement(name, props, props.children);
  Comp.displayName = name;
  return Comp;
};

export const Svg = createSvgMock('Svg');
export const Circle = createSvgMock('Circle');
export const Path = createSvgMock('Path');
export const Polygon = createSvgMock('Polygon');
export const Rect = createSvgMock('Rect');
export const G = createSvgMock('G');

export default Svg;
