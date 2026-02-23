import { StatusBarItem } from 'parsifly-extension-base';

import { version } from './../package.json';


export const createStatusBarWebAppVersionIndicator = () => {
  return new StatusBarItem({
    key: 'web-app-version-indicator-status-bar-item',
    initialValue: {
      side: 'right',
      label: `Web App (${version})`,
      description: 'Version of the web app project'
    },
  });
}
