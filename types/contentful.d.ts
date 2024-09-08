declare module '@contentful/rich-text-react-renderer' {
    import { Document } from '@contentful/rich-text-types';
    import { ReactNode } from 'react';
  
    interface Options {
      renderNode?: {
        [key: string]: (node: any, children: ReactNode) => ReactNode;
      };
    }
  
    export function documentToReactComponents(
      document: Document,
      options?: Options
    ): ReactNode;
  }
  