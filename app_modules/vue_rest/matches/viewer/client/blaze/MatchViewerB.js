import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import MatchViewer from '../MatchViewer';
import { LiveMatchLogs } from './../../../../../../collections/collections';

var tmt = null;
var component = null;
var handle = null;
Template.MatchViewerB.onRendered(function () {
  if (tmt) {
    clearTimeout(tmt);
    initComponent(this);
  } else {
    tmt = setTimeout(() => {
      initComponent(this);
    }, 500);
  }

  function initComponent(self) {
    let cursor = LiveMatchLogs.find();
    handle = Meteor.subscribe('match-viewer', self.data.matchID, {
      onReady: () => {}
    });
    component = MatchViewer('#match-viewer', self.data.matchID, cursor, false);
  }
});

Template.MatchViewerB.onDestroyed(function () {
  if (component) {
    component.$destroy();
    handle.stop();
  }
});