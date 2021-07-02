var express = require('express');
var router = express.Router();
const {users, printers} = require('./../database');

/* GET retrieve all users. */
router.get('/', function (req, res, next) {
  const storedUsers = Object.values(users);
  return res.status(200).json({
    users: storedUsers
  });
});

/* GET retrieve all printers associated to the provided User ID. */
router.get('/:userId/printers', (req, res, next) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400)
      .json({message: 'Invalid User ID'});
  }

  const user = users[userId];
  if (!user) {
    return res.status(404)
      .json({message: 'User could not be found'});
  }

  if (!user.printers) {
    return res.status(200)
      .json({printers: []})
  }

  const userPrinters = Object.values(printers).filter(printer => user.printers.includes(printer.id));

  return res.status(200)
    .json({
      printers: userPrinters,
    })
})

/* GET retrieve all printing jobs for the provided printer for the given User ID. */
router.get('/:userId/printers/:printerId/jobs', (req, res, next) => {
  const userId = parseInt(req.params.userId);
  const printerId = parseInt(req.params.printerId);

  if (!userId) {
    return res.status(400)
      .json({message: 'Invalid User ID'});
  }

  if (!printerId) {
    return res.status(400)
      .json({message: 'Printer ID is required'});
  }

  const storedUser = users[userId];
  console.log(storedUser);
  if (!storedUser) {
    return res.status(400)
      .json({message: 'User could not be found'});
  }

  if (!storedUser.printers.includes(printerId)) {
    return res.status(404)
      .json({message: 'You are not assigned to the provided printer.'});
  }

  const printer = printers[printerId];
  if (!printerId) {
    return res.status(404)
      .json({message: 'The printer could not be found.'});
  }

  const printJobs = printer.printJobs || [];

  return res.status(200)
    .json({
      user: storedUser,
      printer,
      printJobs,
    })
})

// POST connect to the printer with the provided Printer ID.
router.post('/:userId/printers/:printerId', (req, res, next) => {
  const userId = parseInt(req.params.userId);
  const printerId = parseInt(req.params.printerId);

  if (!userId) {
    return res.status(400)
      .json({message: 'Invalid User ID.'});
  }

  if (!printerId) {
    return res.status(400)
      .json({message: 'Invalid Printer ID.'});
  }

  const storedUser = users[userId];
  if (!storedUser) {
    return res.status(400)
      .json({message: 'Invalid User ID.'});
  }

  if (storedUser.printers.includes(printerId)) {
    return res.status(400)
      .json({
        printerId,
        message: 'You are already connected to the printer.'
      });
  }

  storedUser.printers.push(printerId);

  return res.status(200)
    .json({
      storedUser,
      printerId,
      message: 'Successfully connected to the printer.'
    });
})

/* DELETE remove the printer associated to the user based on the provided Printer ID. */
router.delete('/:userId/printers/:printerId', (req, res, next) => {
  const userId = parseInt(req.params.userId);
  const printerId = parseInt(req.params.printerId);

  if (!userId) {
    return res.status(400)
      .json({success: false, message: 'Invalid User ID.'});
  }

  if (!printerId) {
    return res.status(400)
      .json({success: false, message: 'Invalid Printer ID.'});
  }

  const storedUser = users[userId];
  if (!storedUser) {
    return res.status(400)
      .json({success: false, message: 'Invalid User ID.'});
  }

  if (!storedUser.printers.includes(printerId)) {
    return res.status(400)
      .json({
        success: false,
        printerId,
        message: 'You are not connected the printer.'
      });
  }

  storedUser.printers = storedUser.printers.filter(id => id !== printerId);

  return res.status(200)
    .json({
      success: true,
      userId,
      printerId,
      message: 'Successfully disconnected from the printer.',
    });
});

/* POST create a new print job to the printer who has the provided Printer ID. */
router.post('/:userId/printers/:printerId/jobs', (req, res, next) => {
  const userId = parseInt(req.params.userId);
  const printerId = parseInt(req.params.printerId);


  if (!userId) {
    return res.status(400)
      .json({success: false, message: 'Invalid User ID.'});
  }

  if (!printerId) {
    return res.status(400)
      .json({success: false, message: 'Invalid Printer ID.'});
  }

  const storedUser = users[userId];
  if (!storedUser) {
    return res.status(400)
      .json({success: false, message: 'Invalid User ID.'});
  }

  if (!storedUser.printers.includes(printerId)) {
    return res.status(400)
      .json({
        success: false,
        printerId,
        message: 'You are not connected the printer.'
      });
  }

  const printer = printers[printerId];
  if (!printer) {
    return res.status(400)
      .json({
        success: false,
        printerId,
        message: 'The printer is offline.'
      })
  }

  const printerJob = {
    jobId: Math.round(Math.random() * 10000000),
    user: userId,
    printer: printerId,
    startTime: new Date().getTime(),
    duration: Math.round(Math.random() * 60),
  };

  if (!printer.jobs) {
    printer.jobs = [printerJob]
  } else {
    printer.jobs = [...printer.jobs, printerJob];
  }

  return res.status(201)
    .json({
      success: true,
      printerJob,
    })
})

/* DELETE remove the print job that matches the associated Job ID.  If the job is completed, it is not removed */
router.delete('/users/:userId/printers/:printerId/jobs/:jobId', (req, res, next) => {
  const userId = parseInt(req.params.userId);
  const printerId = parseInt(req.params.printerId);
  const jobId = parseInt(req.params.jobId);

  if (!userId) {
    return res.status(400)
      .json({success: false, message: 'Invalid User ID.'});
  }

  if (!printerId) {
    return res.status(400)
      .json({success: false, message: 'Invalid Printer ID.'});
  }

  if (!jobId) {
    return res.status(400)
      .json({success: false, message: 'A printer Job ID is required.'});
  }

  const storedUser = users[userId];
  if (!storedUser) {
    return res.status(400)
      .json({success: false, message: 'Invalid User ID.'});
  }

  if (!storedUser.printers.includes(printerId)) {
    return res.status(400)
      .json({
        success: false,
        printerId,
        message: 'You are not connected the printer.'
      });
  }

  const printer = printers[printerId];
  if (!printer) {
    return res.status(400)
      .json({
        success: false,
        printerId,
        message: 'The printer is offline.'
      })
  }

  if (!printer.jobs || printer.jobs.length === 0) {
    return res.status(400)
      .json({
        success: false,
        message: 'There are no jobs for this printer.'
      })
  }

  if (!printer.jobs.includes(jobId)) {
    return res.status(404)
      .json({success: false, jobId, message: 'The provided job could not be found'})
  }

  printer.jobs = printer.jobs.filter(job => job !== jobId);

  // Validate that the job duration has not passed.  If it has, return a message stating that the job is already complete.

  return res.status(200)
    .json({success: true, message: 'The job has been deleted successfully.'});
})

module.exports = router;
