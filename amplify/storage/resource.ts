import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'amplifyTeamDrive',

  access: (allow) => ({
    'player-data/*': [
      allow.guest.to(['read', 'write', 'delete']),
      allow.entity('identity').to(['read', 'write', 'delete'])
    ],}),
    

});