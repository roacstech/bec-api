const _ = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment');

module.exports.registration = async (props) => {
  const db = global.dbConnection;

  try {
    const {
      studentfirstname,
      studentlastname,
      studentdob,
      studentemail,
      address,
      studentmobile,
      parentcontact,
      currentstatus,
      currentstatusdescription,
      studentgap,
      studentgapdescription,
      marritalstatus,
      dateofmarriage,
      kids,
      spousedob,
      spouseresume,
      fatheroccupation,
      motheroccupation,
      sibilings,
      parentsincome,
      additionalsponsers,
      additionalsponsersrelationship,
      additionalsponsersincome,
      appliedotheruniversitydescription,
      visitothercountries,
      visitothercountriesdescription,
      visarefusal,
      visarefusaldescription,
      familyinoverseas,
      familyinoverseascountry,
      familyinoverseasrelationship,
      counselorcomments,
      knowaboutoffice,
      passportstatus,
      passportexpirydate,
      academicdetails,
      languagetest,
      interestedcourse,
      interestedcountry,
      userid,
    } = props;

    const currentYear = moment().year();

    const checkEmailExist = await db('app_users')
      .where({ authname: studentemail })
      .first();

    const checkContactExist = await db('app_users')
      .where({ primarycontact: studentmobile })
      .first();

    if (checkEmailExist)
      return {
        code: 200,
        status: false,
        message: 'Student email already exists',
      };

    if (checkContactExist)
      return {
        code: 200,
        status: false,
        message: 'Student contact number already exists',
      };

    const password = Math.floor(Math.random() * 9000 + 1000).toString();
    const hashpassword = bcrypt.hashSync(password, 10);

    const result = await db.transaction(async (trx) => {
      const [studentuserid] = await trx('app_users').insert({
        authname: studentemail,
        username: `${studentfirstname} ${studentlastname}`.toUpperCase(),
        password,
        hashpassword,
        primarycontact: studentmobile,
        email: studentemail,
        roleid: 3,
      });

      if (!studentuserid) throw new Error('Failed to create student user');

      const userUniqueId = `BEC-${currentYear}/${String(studentuserid).padStart(
        6,
        '0'
      )}`;

      await trx('app_users')
        .where({ userid: studentuserid })
        .update({ useruniqueid: userUniqueId });

      const [insertstudentId] = await trx('students').insert({
        userid: studentuserid,
        adduserid: userid,
        studentfirstname,
        studentlastname,
        address,
        studentdob,
        studentemail,
        studentmobile,
        parentcontact,
        currentstatus,
        currentstatusdescription,
        studentgap,
        studentgapdescription,
        marritalstatus,
        dateofmarriage,
        kids,
        spousedob,
        spouseresume,
        fatheroccupation,
        motheroccupation,
        sibilings,
        parentsincome,
        additionalsponsers,
        additionalsponsersrelationship,
        additionalsponsersincome,
        appliedotheruniversitydescription,
        visitothercountries,
        visitothercountriesdescription,
        visarefusal,
        visarefusaldescription,
        familyinoverseas,
        familyinoverseascountry,
        familyinoverseasrelationship,
        counselorcomments,
        knowaboutoffice,
        passportstatus,
        passportexpirydate,
      });

      if (!insertstudentId) throw new Error('Failed to insert student');

      const studentUniqueId = `BEC-${currentYear}/${String(
        insertstudentId
      ).padStart(6, '0')}`;

      await trx('students')
        .where({ studentid: insertstudentId })
        .update({ studentuniqueid: studentUniqueId });

      await Promise.all(
        [
          academicdetails?.length
            ? trx('academic_details').insert(
                academicdetails.map((acad) => ({
                  studentid: insertstudentId,
                  ...acad,
                }))
              )
            : null,

          languagetest?.length
            ? trx('language_test_details').insert(
                languagetest.map((lang) => ({
                  studentid: insertstudentId,
                  ...lang,
                }))
              )
            : null,

          interestedcourse?.length
            ? trx('interested_course').insert(
                interestedcourse.map((courseId) => ({
                  studentid: insertstudentId,
                  courseid: courseId,
                }))
              )
            : null,

          interestedcountry?.length
            ? trx('interested_countries').insert(
                interestedcountry.map((countryId) => ({
                  studentid: insertstudentId,
                  countryid: countryId,
                }))
              )
            : null,
        ].filter(Boolean)
      );

      return {
        code: 200,
        status: true,
        message: 'Student created successfully',
        notifydata: {
          studentname: `${studentfirstname} ${studentlastname}`,
          studentuniqueid: studentUniqueId,
        },
        mailProps: {
          studentemail,
          studentmobile,
          studentname: `${studentfirstname} ${studentlastname}`,
          password,
        },
      };
    });

    return result;
  } catch (err) {
    console.error('Error creating student:', err);
    return { code: 500, status: false, message: 'Failed to create student' };
  }
};

module.exports.getStudent = async (props) => {
  const db = global.dbConnection;

  try {
    const {
      studentid,
      studentemail,
      studentmobile,
      approvalstatus, // No default value, so we handle it dynamically
    } = props;

    let query = db('students').select('*');

    // Fetch only approved students (approvalstatus = 1)
    if (approvalstatus) {
      query = query.where('students.approvalstatus', approvalstatus);
    }

    if (studentid) query = query.where('students.studentid', studentid);
    if (studentemail)
      query = query.where('students.studentemail', studentemail);
    if (studentmobile)
      query = query.where('students.studentmobile', studentmobile);

    const studentData = await query;

    if (!studentData.length) {
      return { code: 200, status: false, message: 'No students found' };
    }

    await Promise.all(
      studentData.map(async (student) => {
        student.academicDetails = await db('academic_details')
          .leftJoin(
            'academics',
            'academics.academicid',
            'academic_details.academicid'
          )
          .where({ studentid: student.studentid });

        student.languageTestDetails = await db('language_test_details')
          .leftJoin(
            'language_tests',
            'language_tests.languagetestid',
            'language_test_details.languagetestid'
          )
          .where({ studentid: student.studentid });

        student.interestedCourse = await db('interested_course')
          .leftJoin('courses', 'courses.courseid', 'interested_course.courseid')
          .where({ studentid: student.studentid });

        student.interestedCountries = await db('interested_countries')
          .leftJoin(
            'countries',
            'countries.countryid',
            'interested_countries.countryid'
          )
          .where({ studentid: student.studentid });
      })
    );

    return { code: 200, status: true, response: studentData };
  } catch (err) {
    console.error('Error fetching student:', err);
    return { code: 500, status: false, message: 'Failed to fetch student' };
  }
};

module.exports.editStudent = async (props) => {
  const db = global.dbConnection;

  try {
    const {
      studentid,
      studentfirstname,
      studentlastname,
      address,
      studentdob,
      studentemail,
      studentmobile,
      parentcontact,
      currentstatus,
      currentstatusdescription,
      studentgap,
      studentgapdescription,
      marritalstatus,
      dateofmarriage,
      kids,
      spousedob,
      spouseresume,
      fatheroccupation,
      motheroccupation,
      sibilings,
      parentsincome,
      additionalsponsers,
      additionalsponsersrelationship,
      additionalsponsersincome,
      appliedotheruniversitydescription,
      visitothercountries,
      visitothercountriesdescription,
      visarefusal,
      visarefusaldescription,
      familyinoverseas,
      familyinoverseascountry,
      familyinoverseasrelationship,
      counselorcomments,
      knowaboutoffice,
      passportstatus,
      passportexpirydate,
      academicdetails,
      languagetest,
      interestedcourse,
      interestedcountry,
    } = props;

    const studentExists = await db('students').where({ studentid }).first();

    if (!studentExists) {
      return { code: 404, status: false, message: 'Student not found' };
    }

    await db.transaction(async (trx) => {
      await trx('students').where({ studentid }).update({
        studentfirstname,
        studentlastname,
        studentdob,
        studentemail,
        address,
        studentmobile,
        parentcontact,
        currentstatus,
        currentstatusdescription,
        studentgap,
        studentgapdescription,
        marritalstatus,
        dateofmarriage,
        kids,
        spousedob,
        spouseresume,
        fatheroccupation,
        motheroccupation,
        sibilings,
        parentsincome,
        additionalsponsers,
        additionalsponsersrelationship,
        additionalsponsersincome,
        appliedotheruniversitydescription,
        visitothercountries,
        visitothercountriesdescription,
        visarefusal,
        visarefusaldescription,
        familyinoverseas,
        familyinoverseascountry,
        familyinoverseasrelationship,
        counselorcomments,
        knowaboutoffice,
        passportstatus,
        passportexpirydate,
      });

      await trx('academic_details').where({ studentid }).del();
      if (academicdetails?.length) {
        await trx('academic_details').insert(
          academicdetails.map((acad) => ({ studentid, ...acad }))
        );
      }

      await trx('language_test_details').where({ studentid }).del();
      if (languagetest?.length) {
        await trx('language_test_details').insert(
          languagetest.map((lang) => ({ studentid, ...lang }))
        );
      }

      await trx('interested_course').where({ studentid }).del();
      if (interestedcourse?.length) {
        await trx('interested_course').insert(
          interestedcourse.map((courseId) => ({
            studentid,
            courseid: courseId,
          }))
        );
      }

      await trx('interested_countries').where({ studentid }).del();
      if (interestedcountry?.length) {
        await trx('interested_countries').insert(
          interestedcountry.map((countryId) => ({
            studentid,
            countryid: countryId,
          }))
        );
      }
    });

    return { code: 200, status: true, message: 'Student updated successfully' };
  } catch (err) {
    console.error('Error updating student:', err);
    return { code: 500, status: false, message: 'Failed to update student' };
  }
};

module.exports.updateApprovalStatus = async (props) => {
  const db = global.dbConnection;

  try {
    const { studentid, key } = props;

    // Define status messages
    const statusMessages = {
      1: 'Approved',
      2: 'Pending',
      3: 'Rejected',
    };

    // Validate if key is within allowed values
    if (![1, 2, 3].includes(key)) {
      return {
        code: 400,
        status: false,
        message: 'Invalid approval status value',
      };
    }

    const student = await db('students').where({ studentid }).first();

    if (!student) {
      return { code: 404, status: false, message: 'Student not found' };
    }

    if (student.approvalstatus === key) {
      return {
        code: 400,
        status: false,
        message: `Student is already marked as ${statusMessages[key]}`,
      };
    }

    const updatedRows = await db('students')
      .where({ studentid })
      .update({ approvalstatus: key });

    if (!updatedRows) {
      return {
        code: 400,
        status: false,
        message: 'Failed to update approval status',
      };
    }

    return {
      code: 200,
      status: true,
      message: `Approval status updated to ${statusMessages[key]}`,
    };
  } catch (err) {
    console.error('Error updating approval status:', err);
    return { code: 500, status: false, message: 'Internal server error' };
  }
};

module.exports.updateOfferLetterStatus = async (props) => {
  const db = global.dbConnection;

  try {
    const { studentid, enrollmentid, key } = props;

    // Define status messages
    const statusMessages = {
      1: 'Approved',
      2: 'Pending',
      3: 'Rejected',
    };

    // Validate if key is within allowed values
    if (![1, 2, 3].includes(key)) {
      return {
        code: 400,
        status: false,
        message: 'Invalid approval status value',
      };
    }

    const student = await db('students').where({ studentid }).first();

    if (!student) {
      return { code: 404, status: false, message: 'Student not found' };
    }

    const updatedRows = await db('enrollments')
      .where({ studentid, enrollmentid })
      .update({
        offerletterstatus: key,
        enrollmentstatusid: key == 1 ? 4 : key == 3 ? 5 : 3,
      });

    if (!updatedRows) {
      return {
        code: 400,
        status: false,
        message: 'Failed to update approval status',
      };
    }

    return {
      code: 200,
      status: true,
      message: `Approval status updated to ${statusMessages[key]}`,
    };
  } catch (err) {
    console.error('Error updating approval status:', err);
    return { code: 500, status: false, message: 'Internal server error' };
  }
};

module.exports.updateStudentStatus = async (props) => {
  const { studentid, key } = props;
  const db = global.dbConnection;

  console.log('studentid received:', studentid); // Debugging Log

  if (!studentid) {
    return { code: 400, status: false, message: 'studentid is required' };
  }

  try {
    // Check if the student exists
    const checkStudentExist = await db('students').where({ studentid });

    if (_.isEmpty(checkStudentExist)) {
      return {
        code: 404,
        status: false,
        message: 'This student does not exist',
      };
    }

    // Start database transaction
    const result = await db.transaction(async (trx) => {
      let studentstatusid;
      let statusMessage;

      switch (key) {
        case 1: // Activate the student
          studentstatusid = 1;
          statusMessage = 'Student activated successfully';
          break;

        case 2: // Deactivate the student
          studentstatusid = 2;
          statusMessage = 'Student deactivated successfully';
          break;

        default:
          return { code: 400, status: false, message: 'Invalid status key' };
      }

      // Update `students` table
      const updateStudent = await trx('students')
        .update({ studentstatusid })
        .where({ studentid });

      if (updateStudent === 0) {
        return {
          code: 200,
          status: false,
          message: `Failed to update student status`,
        };
      }

      // Update `app_users.studentloginstatus`
      const updateAppUsers = await trx('app_users')
        .update({ studentloginstatus: studentstatusid })
        .where('userid', function () {
          this.select('userid').from('students').where('studentid', studentid);
        });

      if (updateAppUsers === 0) {
        console.warn('Warning: No matching record found in `app_users`');
      }

      return {
        code: 200,
        status: true,
        message: statusMessage,
      };
    });

    return result;
  } catch (err) {
    console.error('Error updating student status:', err);
    return {
      code: 500,
      status: false,
      message: 'Failed to update student status',
    };
  }
};

module.exports.selectUniversity = async (props) => {
  const db = global.dbConnection;

  try {
    const { university, studentid } = props;

    const checkStudent = await db('students')
      .where({
        studentid,
      })
      .first();

    if (!checkStudent) {
      return {
        code: 200,
        status: false,
        message: 'Student not found',
      };
    }

    const result = await db.transaction(async (trx) => {
      for (const univer of university) {
        const checkUniversity = await trx('universities')
          .where({
            universityid: univer.universityid,
          })
          .first();
        if (!checkUniversity) {
          return {
            code: 200,
            status: false,
            message: 'University not found',
          };
        }
        const checkCourses = await trx('courses')
          .where({
            courseid: univer.courseid,
          })
          .first();
        if (!checkCourses) {
          return {
            code: 200,
            status: false,
            message: 'Course not found',
          };
        }
        const checkDepartment = await trx('departments')
          .where({
            departmentid: univer.departmentid,
          })
          .first();
        if (!checkDepartment) {
          return {
            code: 200,
            status: false,
            message: 'Department not found',
          };
        }

        const insertEnrollments = await trx('enrollments').insert({
          studentid,
          universityid: univer.universityid,
          courseid: univer.courseid,
          departmentid: univer.departmentid,
        });

        if (!insertEnrollments || insertEnrollments.length === 0) {
          throw new Error('Failed to insert an enrollment record');
        }
      }

      return {
        code: 200,
        status: true,
        message: 'Student university selection saved successfully',
      };
    });

    return result;
  } catch (err) {
    console.error('Error creating student:', err);
    return {
      code: 500,
      status: false,
      message: 'Failed to create student',
    };
  }
};

module.exports.assignAdmin = async (props) => {
  const db = global.dbConnection;

  try {
    const { adminid, studentid } = props;

    // Check if student exists
    const checkStudent = await db('students').where({ studentid }).first();

    if (!checkStudent) {
      return {
        code: 200,
        status: false,
        message: 'Student not found',
      };
    }

    const checkAdmin = await db('admins').where({ adminid }).first();
    if (!checkAdmin) {
      return {
        code: 200,
        status: false,
        message: 'Admin not found',
      };
    }

    const result = await db.transaction(async (trx) => {
      const adminAssigned = await trx('students')
        .update({ adminid })
        .where({ studentid });

      if (!adminAssigned) {
        throw new Error('Failed to assign admin to student');
      }

      return {
        code: 200,
        status: true,
        message: 'Admin assigned to student successfully',
      };
    });

    return result;
  } catch (err) {
    console.error('Error in assignAdmin:', err);
    return {
      code: 500,
      status: false,
      message: err.message || 'Failed to assign admin',
    };
  }
};

module.exports.uploadStudentChecklistFile = async (props) => {
  const { documents, enrollmentid, studentchecklistid } = props;
  const db = global.dbConnection;

  const trx = await db.transaction();

  try {
    // Get student information first
    const studentInfo = await trx('student_checklist')
      .select(
        'students.studentid',
        'students.studentfirstname',
        'students.studentlastname'
      )
      .join('students', 'students.studentid', 'student_checklist.studentid')
      .where({ studentchecklistid })
      .first();

    if (!studentInfo) {
      throw new Error('Student checklist not found');
    }

    await Promise.all(
      documents.map(async (doc) => {
        const affectedRows = await trx('check_list_data')
          .update({
            documenturl: doc.documenturl,
            updated_at: new Date(),
          })
          .where({ checklistdataid: doc.checklistdataid });

        if (affectedRows === 0) {
          throw new Error(
            `Failed to update checklistdataid ${doc.checklistdataid}`
          );
        }
      })
    );

    await trx('student_checklist')
      .update({ uploadedstatus: 1 })
      .where({ studentchecklistid });

    const message = `${studentInfo.studentfirstname} ${studentInfo.studentlastname} uploaded his documents`;
    await trx('notification').insert({
      message,
      type: 'ChecklistUpload',
      studentid: studentInfo.studentid,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });

    await trx.commit();

    return {
      code: 200,
      status: true,
      message: 'Checklist files uploaded successfully.',
    };
  } catch (err) {
    await trx.rollback();
    console.error('Student File Upload Error:', err);
    return {
      code: 500,
      status: false,
      message: err.message || 'Failed to upload checklist files.',
    };
  }
};

module.exports.uploadOfferLetterChecklistFile = async (props) => {
  const {
    studentid,
    checklistid,
    checklistitemid,
    offerletterchecklisturl, // This is the URL field
  } = props;

  const db = global.dbConnection;

  try {
    // Ensure all variables have values
    if (
      !studentid ||
      !checklistid ||
      !checklistitemid ||
      !offerletterchecklisturl
    ) {
      return {
        code: 400,
        status: false,
        message: 'Missing required fields.',
      };
    }

    const message = `Offer letter uploaded for Student ID :${studentid}`;
    await trx('notification').insert({
      message,
      // enrollmentid,
      type: 'OfferletterUpload',
      studentid: studentid,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });

    // Check if a record already exists (without using 'enrollmentid')
    const existing = await db('check_list_data')
      .where({
        studentid: studentid, // Explicitly pass the values
        checklistid: checklistid,
        checklistitemid: checklistitemid,
      })
      .first();

    if (existing) {
      // Update the document URL if record exists
      await db('check_list_data')
        .where('checklistdataid', existing.checklistdataid)
        .update({ offerletterchecklisturl }); // Update the new URL column

      return {
        code: 200,
        status: true,
        message: 'Offer letter checklist file updated successfully.',
        checklistdataid: existing.checklistdataid,
      };
    } else {
      // Insert new record if not found
      const [insertId] = await db('check_list_data').insert({
        studentid,
        checklistid,
        checklistitemid,
        offerletterchecklisturl, // Store the URL in the new column
      });

      if (!insertId) {
        return {
          code: 500,
          status: false,
          message: 'Failed to upload offer letter checklist file.',
        };
      }

      return {
        code: 200,
        status: true,
        message: 'Offer letter checklist file uploaded successfully.',
        checklistdataid: insertId,
      };
    }
  } catch (err) {
    console.error('Offer Letter File Upload Error:', err);
    return {
      code: 500,
      status: false,
      message: 'Server error while uploading offer letter checklist file.',
      error: err.message,
    };
  }
};

module.exports.uploadPaymentReceiptFile = async (props) => {
  const {
    studentid,
    checklistid,
    checklistitemid,
    receipturl, // This is the URL field for payment receipt
  } = props;

  const db = global.dbConnection;

  try {
    // Ensure all variables have values
    if (!studentid || !checklistid || !checklistitemid || !receipturl) {
      return {
        code: 400,
        status: false,
        message: 'Missing required fields.',
      };
    }

    // Check if a record already exists (without using 'enrollmentid')
    const existing = await db('check_list_data')
      .where({
        studentid: studentid, // Explicitly pass the values
        checklistid: checklistid,
        checklistitemid: checklistitemid,
      })
      .first();

    const message = `Payment Receipt uploaded for Student ID : ${studentid}`;
    await trx('notification').insert({
      message,
      // enrollmentid,
      type: 'paymentreceiptUpload',
      studentid: studentid,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    if (existing) {
      // Update the payment receipt URL if the record exists
      await db('check_list_data')
        .where('checklistdataid', existing.checklistdataid)
        .update({ receipturl }); // Update the payment receipt URL column

      return {
        code: 200,
        status: true,
        message: 'Payment receipt file updated successfully.',
        checklistdataid: existing.checklistdataid,
      };
    } else {
      // Insert new record if not found
      const [insertId] = await db('check_list_data').insert({
        studentid,
        checklistid,
        checklistitemid,
        receipturl, // Store the payment receipt URL in the new column
      });

      if (!insertId) {
        return {
          code: 500,
          status: false,
          message: 'Failed to upload payment receipt file.',
        };
      }

      return {
        code: 200,
        status: true,
        message: 'Payment receipt file uploaded successfully.',
        checklistdataid: insertId,
      };
    }
  } catch (err) {
    console.error('Payment Receipt File Upload Error:', err);
    return {
      code: 500,
      status: false,
      message: 'Server error while uploading payment receipt file.',
      error: err.message,
    };
  }
};

module.exports.uploadCoEFile = async (props) => {
  const {
    studentid,
    checklistid,
    checklistitemid,
    coeurl, // This is the URL for the CoE file
  } = props;

  const db = global.dbConnection;

  try {
    const message = `COE letter uploaded for Student ID :${studentid}`;
    await trx('notification').insert({
      message,
      // enrollmentid,
      type: 'COEUpload',
      studentid: studentid,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    // Validate if all required fields are present
    if (!studentid || !checklistid || !checklistitemid || !coeurl) {
      return {
        code: 400,
        status: false,
        message: 'Missing required fields.',
      };
    }

    // Log values for debugging
    console.log('Inserting/updating with:', {
      studentid,
      checklistid,
      checklistitemid,
      coeurl,
    });

    // Check if the record already exists in the database
    const existing = await db('check_list_data')
      .where({
        studentid,
        checklistid,
        checklistitemid,
      })
      .first();

    if (existing) {
      // If the record exists, update the CoE file URL
      await db('check_list_data')
        .where('checklistdataid', existing.checklistdataid)
        .update({ coeurl });

      return {
        code: 200,
        status: true,
        message: 'CoE file URL updated successfully.',
        checklistdataid: existing.checklistdataid,
      };
    } else {
      // If no record exists, insert a new record
      const [insertId] = await db('check_list_data').insert({
        studentid,
        checklistid,
        checklistitemid,
        coeurl, // Save the CoE file URL in the database
      });

      if (!insertId) {
        return {
          code: 500,
          status: false,
          message: 'Failed to upload CoE file.',
        };
      }

      return {
        code: 200,
        status: true,
        message: 'CoE file uploaded successfully.',
        checklistdataid: insertId,
      };
    }
  } catch (err) {
    console.error('CoE File Upload Error:', err);
    return {
      code: 500,
      status: false,
      message: 'Server error while uploading CoE file.',
      error: err.message,
    };
  }
};

module.exports.uploadVisaChecklistFile = async (props) => {
  const {
    studentid,
    checklistid,
    checklistitemid,
    visaurl, // This is the URL for the visa checklist
  } = props;

  const db = global.dbConnection;

  try {
    const message = `Visa check list uploaded for Student ID :${studentid}`;
    await trx('notification').insert({
      message,
      // enrollmentid,
      type: 'visachecklistUpload',
      studentid: studentid,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    // Validate if all required fields are present
    if (!studentid || !checklistid || !checklistitemid || !visaurl) {
      return {
        code: 400,
        status: false,
        message: 'Missing required fields.',
      };
    }

    // Log values for debugging
    console.log('Inserting/updating with:', {
      studentid,
      checklistid,
      checklistitemid,
      visaurl,
    });

    // Check if the record already exists in the database
    const existing = await db('check_list_data')
      .where({
        studentid,
        checklistid,
        checklistitemid,
      })
      .first();

    if (existing) {
      // If the record exists, update the Visa URL
      await db('check_list_data')
        .where('checklistdataid', existing.checklistdataid)
        .update({ visaurl });

      return {
        code: 200,
        status: true,
        message: 'Visa checklist URL updated successfully.',
        checklistdataid: existing.checklistdataid,
      };
    } else {
      // If no record exists, insert a new record
      const [insertId] = await db('check_list_data').insert({
        studentid,
        checklistid,
        checklistitemid,
        visaurl, // Save the Visa URL in the database
      });

      if (!insertId) {
        return {
          code: 500,
          status: false,
          message: 'Failed to upload Visa checklist.',
        };
      }

      return {
        code: 200,
        status: true,
        message: 'Visa checklist uploaded successfully.',
        checklistdataid: insertId,
      };
    }
  } catch (err) {
    console.error('Visa Checklist Upload Error:', err);
    return {
      code: 500,
      status: false,
      message: 'Server error while uploading Visa checklist.',
      error: err.message,
    };
  }
};
