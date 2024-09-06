import config, { IStylishBoxProps } from './StylishBox.config';
import { T4DComponent, useEnhancedEditor } from '@ws-ui/webform-editor';
import Build from './StylishBox.build';
import Render from './StylishBox.render';

const StylishBox: T4DComponent<IStylishBoxProps> = (props) => {
  const { enabled } = useEnhancedEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return enabled ? <Build {...props} /> : <Render {...props} />;
};

StylishBox.craft = config.craft;
StylishBox.info = config.info;
StylishBox.defaultProps = config.defaultProps;

export default StylishBox;
