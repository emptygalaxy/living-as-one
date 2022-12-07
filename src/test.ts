import {LivingAsOneClient} from './LivingAsOneClient';
import * as dotenv from 'dotenv';
dotenv.config();

const client = new LivingAsOneClient();
client
  .login(
    process.env.LIVING_AS_ONE_USERNAME || '',
    process.env.LIVING_AS_ONE_PASSWORD || ''
  )
  .then(async profile => {
    // client.
    if (profile) {
      console.dir(profile);

      console.log('Users:');
      console.log(await client.users.getUsers());

      console.log('Encoders:');
      console.log(await client.encoders.getEncoders());

      console.log('Events:');
      console.log(await client.events.getEvents());
      const event = await client.events.getLiveEvent();
      if (event) {
        console.log('Current live event:');
        console.dir(event, {depth: 4});

        console.log('Cues:');
        console.log(await client.cues.getCues(event.uuid));

        // create a cue for the current time
        await client.cues.createLiveCue('Test cue', false);

        // delete the cues that are not shared
        await client.cues.deleteUnsharedCues();
      }
    }
  })
  .catch(err => {
    console.error(err);
  });
