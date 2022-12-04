import React, { ReactElement } from "react";
import autoLoggerInstance from '../index';

interface AutoTrackerComponentProps {
  children?: ReactElement<any, any> | null;
}

const AutoTrackerComponent: React.FC<AutoTrackerComponentProps> = (props) => {
  const { children } = props;

  if (!children) {
    return null;
  } 
  const originProps = children.props || {};
  
  const originPropsOnClick = originProps.onClick;


  const newProps = Object.assign({}, originProps, {
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      autoLoggerInstance.reportClick(e);
      originPropsOnClick?.(e);
    }
  })

  return React.cloneElement(children, newProps);
}

export default AutoTrackerComponent;