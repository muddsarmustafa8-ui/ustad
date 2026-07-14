const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  BUSINESS_OWNER: 'business_owner',
  BUSINESS_STAFF: 'business_staff',
  CUSTOMER: 'customer',
};

const VERIFICATION_LEVELS = {
  UNVERIFIED: 'unverified',
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PREMIUM: 'premium',
};

const BUSINESS_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected',
};

const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

module.exports = {
  ROLES,
  VERIFICATION_LEVELS,
  BUSINESS_STATUS,
  BOOKING_STATUS,
};
