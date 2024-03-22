import {useEffect, createElement} from 'react';
import {router} from './index';
import useFrame from "./useFrame";

const Frame = ({src, id = Math.random(), children}) => {
  const frames = useFrame()
  const component = frames?.[id] && frames[id].component;

  useEffect(() => {
    // inertia.set('frame-id', id);
    // inertia.set('frame-src', src);

    router.visit(src, {
      target: id.toString(),
    });
  }, []);

  return createElement("div",
    {'data-inertia-frame-id': id},
    component ? createElement(component, frames[id].props) : children)
};

Frame.displayName = 'InertiaFrame';
export default Frame;