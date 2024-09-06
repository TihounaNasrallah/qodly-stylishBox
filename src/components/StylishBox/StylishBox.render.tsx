import { selectResolver, useEnhancedEditor, useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { CSSProperties, FC, useEffect, useState } from 'react';
import { Element } from '@ws-ui/craftjs-core';
import { IParameters, IStylishBoxProps } from './StylishBox.config';

const StylishBox: FC<IStylishBoxProps> = ({ parameters, className, classNames = [] }) => {
  const { connect } = useRenderer();
  const { resolver } = useEnhancedEditor(selectResolver);
  const [transformedObject, setTransformedObject] = useState<CSSProperties>({});
  const [dataSources, setDataSources] = useState<any[]>([]);
  const {
    actions: { getDatasource },
  } = useSources();

  const processArray = async (arr: IParameters[]): Promise<any[]> => {
    const dataSources = [];
    const transformed: CSSProperties = {};
    for (const obj of arr) {
      const ds = getDatasource(obj.source, obj.source.startsWith('$'));
      if (ds) {
        dataSources.push({ ds, name: obj.name, defaultValue: obj.defaultValue });
        const value = await ds.getValue();
        const propertyName = `--${obj.name}`;
        const tempObj: CSSProperties = {
          [propertyName]: value && value !== '' ? value : obj.defaultValue,
        };
        Object.assign(transformed, tempObj);
      }
    }
    setTransformedObject(transformed);
    return dataSources;
  };

  useEffect(() => {
    const main = async () => {
      const dataSources = await processArray(parameters);
      setDataSources(dataSources);
    };
    main();
  }, [parameters]);

  useEffect(() => {
    const listeners = dataSources
      .filter(({ ds }) => ds.on)
      .map(({ ds, name, defaultValue }) => {
        const handleChange = (newValue: any) => {
          setTransformedObject((prev) => {
            const propertyName = `--${name}`;
            return { ...prev, [propertyName]: newValue || defaultValue };
          });
        };
        ds.on('change', handleChange);
        return () => ds.off('change', handleChange); // Cleanup function
      });

    return () => {
      listeners.forEach((cleanup) => cleanup());
    };
  }, [dataSources]);

  return (
    <div
      ref={connect}
      style={{ width: '100%', height: '100%', ...transformedObject }}
      className={cn(className, classNames)}
    >
      <Element
        id="container"
        style={{ ...transformedObject, width: '100%', height: '100%' }}
        is={resolver.StyleBox}
        canvas
      />
    </div>
  );
};

export default StylishBox;
