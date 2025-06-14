
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'verified':
      return 'text-green-400';
    case 'file-missing':
      return 'text-yellow-400';
    default:
      return 'text-red-400';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'file-missing':
      return 'Files Missing';
    default:
      return 'Not Found';
  }
};
