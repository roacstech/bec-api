const service = require('./service');
const _ = require('lodash');

module.exports.getNotification = async (req, res) => {
  try {
    // Extract query parameters if they exist (for filtering purposes)
    const { id, studentid, message, status } = req.query;
    // Call the service to fetch universities with the filters, if provided
    const response = await service.getNotification({
      id,
      studentid,
      message,
      status,
    });

    return res.status(200).json({
      status: true,
      message: 'Notifications fetched successfully',
      data: response,
    });
  } catch (error) {
    console.error('Error in getNotification:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};

module.exports.updateNotification = async (req, res) => {
  try {
    // Extract query parameters if they exist (for filtering purposes)
    const { id } = req.params;
    
    // Call the service to fetch universities with the filters, if provided
    const response = await service.updateNotification({
      id 
    });

    return res.status(200).json({
      status: true,
      message: 'Notifications fetched successfully',
      data: response,
    });
  } catch (error) {
    console.error('Error in getNotification:', error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error',
    });
  }
};
