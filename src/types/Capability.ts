export enum Capability {
  // Account
  getAccountDetails = 'getAccountDetails',
  updateAccountDetails = 'updateAccountDetails',
  getOrganizationDetails = 'getOrganizationDetails',
  updateOrganizationAccessibleDetails = 'updateOrganizationAccessibleDetails',
  getTaxAndDocuments = 'getTaxAndDocuments',

  // Contacts
  addContacts = 'addContacts',
  getContacts = 'getContacts',
  updateContacts = 'updateContacts',
  deleteContacts = 'deleteContacts',

  // Cues
  addCues = 'addCues',
  getCues = 'getCues',
  updateCues = 'updateCues',
  deleteCues = 'deleteCues',
  deleteAllCues = 'deleteAllCues',
  // Cues - public
  addPublicCues = 'addPublicCues',
  getPublicCues = 'getPublicCues',
  updatePublicCues = 'updatePublicCues',
  deletePublicCues = 'deletePublicCues',
  // Cues - shared
  addSharedCues = 'addSharedCues',
  getSharedCues = 'getSharedCues',
  updateSharedCues = 'updateSharedCues',
  deleteSharedCues = 'deleteSharedCues',
  // Cues - other users
  updateOtherUsersCues = 'updateOtherUsersCues',
  deleteOtherUsersCues = 'deleteOtherUsersCues',

  // Customers
  getCustomer = 'getCustomer',

  // Dashboard
  getDashboard = 'getDashboard',
  getMultisiteDashboard = 'getMultisiteDashboard',

  // Destination groups
  updateDestinationGroups = 'updateDestinationGroups',
  getDestinationGroups = 'getDestinationGroups',
  addDestinationGroups = 'addDestinationGroups',
  deleteDestinationGroups = 'deleteDestinationGroups',

  // Encoders
  getEncoders = 'getEncoders',
  updateEncoders = 'updateEncoders',
  restartEncoders = 'restartEncoders',
  updateEncodersVersion = 'updateEncodersVersion',
  // Encoders - input
  updateEncodersInput = 'updateEncodersInput',
  // Encoders - profiles
  addEncoderProfiles = 'addEncoderProfiles',
  getEncoderProfiles = 'getEncoderProfiles',
  updateEncoderProfiles = 'updateEncoderProfiles',
  addTranscodedEventProfiles = 'addTranscodedEventProfiles',
  // Encoders - web profiles
  getWebEncoderProfiles = 'getWebEncoderProfiles',
  addWebEncoderProfiles = 'addWebEncoderProfiles',
  updateWebEncoderProfiles = 'updateWebEncoderProfiles',
  deleteWebEncoderProfiles = 'deleteWebEncoderProfiles',

  // Events
  addEvents = 'addEvents',
  getEvents = 'getEvents',
  updateEvents = 'updateEvents',
  deleteEvents = 'deleteEvents',
  downloadEvents = 'downloadEvents',
  getTranscodedEvents = 'getTranscodedEvents',
  downloadWebEvents = 'downloadWebEvents',
  updateWebEventProfileStreamUrls = 'updateWebEventProfileStreamUrls',
  // Events - profiles
  getEventProfiles = 'getEventProfiles',
  updateEventProfiles = 'updateEventProfiles',
  // Events - profile users
  addEventProfileUsers = 'addEventProfileUsers',
  getEventProfileUsers = 'getEventProfileUsers',
  deleteEventProfileUsers = 'deleteEventProfileUsers',

  // Schedules
  addSchedules = 'addSchedules',
  getSchedules = 'getSchedules',
  updateSchedules = 'updateSchedules',
  deleteSchedules = 'deleteSchedules',

  // Subscription
  addManageSubscription = 'addManageSubscription',
  getManageSubscription = 'getManageSubscription',
  updateManageSubscription = 'updateManageSubscription',
  deleteManageSubscription = 'deleteManageSubscription',

  // Uploaders
  addVideoUpload = 'addVideoUpload',
  deleteUploaders = 'deleteUploaders',

  // Users
  getUsers = 'getUsers',
  updateUsers = 'updateUsers',
  deleteUsers = 'deleteUsers',
  // Users - invites
  addUserInvites = 'addUserInvites',
  getUserInvites = 'getUserInvites',
  revokeUserInvites = 'revokeUserInvites',
  resendUserInvites = 'resendUserInvites',
}
