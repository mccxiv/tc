export default function prettyChatterNames(input) {
  switch (input) {
    case 'moderators':  return 'Moderators';
    case 'staff':       return 'Staff';
    case 'admins':      return 'Administrators';
    case 'global_mods': return 'Global Moderators';
    case 'viewers':     return 'Viewers';
    default:            return input;
  }
};
