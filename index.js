/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json' with { type: "json" };

AppRegistry.registerComponent(appName, () => App);
