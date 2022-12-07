import {CueManager} from './CueManager';
import {LivingAsOneClient} from './LivingAsOneClient';
import {expect} from 'chai';

describe('CueManager', () => {
  const manager = new CueManager(new LivingAsOneClient());
  describe('leadingZeros', () => {
    it("should lead a value with zero's", () => {
      expect(manager.leadingZeros(1, 2)).to.eq('01');
    });
  });
  describe('formatTime', () => {
    it('should format a time', () => {
      expect(
        manager.formatTime(new Date(Date.UTC(2022, 11, 1, 12, 0, 0, 0)))
      ).to.eq('12:00:00.000');
      expect(
        manager.formatTime(new Date(Date.UTC(2022, 11, 1, 1, 23, 45, 678)))
      ).to.eq('01:23:45.678');
    });
  });
  describe('formulateUrl', () => {
    it('should format a url', () => {
      expect(manager.formulateUrl('event-profile-id', 'event-id')).to.eq(
        '/api_v2.svc/streamprofiles/event-profile-id/events/event-id/cues'
      );
      expect(
        manager.formulateUrl('event-profile-id', 'event-id', 'cue-id')
      ).to.eq(
        '/api_v2.svc/streamprofiles/event-profile-id/events/event-id/cues/cue-id'
      );
    });
  });
});
