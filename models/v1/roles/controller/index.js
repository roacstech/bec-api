const _ = require("lodash");
const Joi = require('joi');
const moment = require("moment");
const service = require("../service");


// module.exports.addModuleWithSubModuleSection = async(req, res) => {
//     try {
//         const schema = Joi.object({
//             moduleid: Joi.number().required(),
//             modulename: Joi.string().required(),
//             create: Joi.string().required(),
//             read: Joi.string().required(),
//             update: Joi.string().required(),
//             remove: Joi.string().required(),
//             modulesection: Joi.optional(),
//             submodule : Joi.optional()
//           })   
//          const validationResult = schema.validate(req.body)
 
//          if(!_.isEmpty(validationResult.error)){
//              return res.send({
//                  status: false,
//                  message: `${validationResult.error.details[0].message}`
//              })
//          }
//          else {
//             const response = await service.addModule(req.body)
//             if (!_.isEmpty(response)) {
//                 return res.send({
//                     status : true,
//                     message : "module added successfully!"
//                 })
//             }
//          }

//     } catch (err) {
//         console.log(err);
//         return res.json({
//             status: false,
//             message : "internal server error!"
//         })
//     }
//     return res.send({
//         status : false,
//         message : "failed to add module!"
//     })
// };

// //modules

// module.exports.addModule = async(req, res) => {
//     try {
//     const response = await service.addModule(req.body)
//             if (!_.isEmpty(response)) {
//                 return res.send({
//                     status : true,
//                     message : "module added successfully!"
//                 })
//          }

//     } catch (err) {
//         console.log(err);
//         return res.json({
//             status: false,
//             message : "internal server error!"
//         })
//     }
//     return res.send({
//         status : false,
//         message : "failed to add module!"
//     })
// };

// module.exports.editModule = async(req, res) => {
//     try {
//         const schema = Joi.object({
//             moduleid: Joi.number().required(),
//             modulename: Joi.string().required(),
//             create: Joi.string().required(),
//             read: Joi.string().required(),
//             update: Joi.string().required(),
//             remove: Joi.string().required(),
//           })   
//          const validationResult = schema.validate(req.body)
 
//          if(!_.isEmpty(validationResult.error)){
//              return res.send({
//                  status: false,
//                  message: `${validationResult.error.details[0].message}`
//              })
//          }
//          else {
//             const response = await service.editModule(req.body)
//             if (!_.isNull(response)) {
//                 return res.send({
//                     status : true,
//                     message : "module edited successfully!"
//                 })
//             }
//          }

//     } catch (err) {
//         console.log(err);
//         return res.json({
//             status: false,
//             message : "internal server error!"
//         })
//     }
//     return res.send({
//         status : false,
//         message : "failed to edit module!"
//     })
// };

module.exports.getModule = async(req, res) => {
    try {
        const response = await service.getModule(req.body)
        if (!_.isEmpty(response)) {
            return res.send({
                status : true,
                message : 'fetched!',
                response : response
            })
        }
        else {
            return res.send({
                status : true,
                message : 'fetched! no data!',
                response : []
            })
        }
    } catch (err) {
        console.log(err);
    }
    return res.send({
        status : false,
        message : 'failed to fetched!'
    })
}

module.exports.getModuleWithSubmodule = async(req, res) => {
    try {
     const response = await service.getModuleWithSubmodule(req.body)
     
     if (!_.isEmpty(response)) {
        return res.send({
            status : true,
            message : "fetched!",
            response : response
        })
     }   
     else {
        return res.send({
            status : true,
            message : "fetched! no data",
            response : []
        })
     }
    } catch (err) {
        console.log(err);
    }
    return res.send({
        status : false,
        message : "failed to fetched!"
    })
}

// module.exports.addSubModule = async(req, res) => {
//     try {
//     const response = await service.addSubModule(req.body)
//             if (!_.isEmpty(response)) {
//                 return res.send({
//                     status : true,
//                     message : "module added successfully!"
//                 })
//          }

//     } catch (err) {
//         console.log(err);
//         return res.json({
//             status: false,
//             message : "internal server error!"
//         })
//     }
//     return res.send({
//         status : false,
//         message : "failed to add module!"
//     })
// };

// module.exports.getAllModulesandSubmoduleSection = async(req, res) => {
//     try {
//         const response = await service.getAllModulesandSubmoduleSection(req.body)
//         if (!_.isEmpty(response)) {
//             return res.send({
//                 status : true,
//                 message : "fetched!",
//                 response : response
//             })
//         }
//         else {
//             return res.send({
//                 status : true,
//                 message : "fetched!",
//                 response : []
//             })
//         }
//     } catch (err) {
//         console.log(err);
//     }
//     return res.send({
//         status : false,
//         message : "failed to fetched!",
//     })
// };

//role and permissions


module.exports.addRolePermission = async(req, res) => {
    try {
        const schema = Joi.object({
           rolename: Joi.string().required(),
           webpermissions: Joi.array().required()
         })   
        const validationResult = schema.validate(req.body)

        if(!_.isEmpty(validationResult.error)){
            return res.send({
                status: false,
                message: `${validationResult.error.details[0].message}`
            })
        }
        else {
            const response = await service.addRolePermission(req.body)
            if (!_.isEmpty(response)) {
                return res.send({
                    status : true,
                    message : "role created successfully!"
                })
            }
        }
    } catch (err) {
        console.log(err);
        return res.send({
            status: false,
            message : "Internal Server Error!"
        })
    }
    return res.send({
        status : false,
        message : "failed to create role!"
    })
};

module.exports.editRolePermssion = async(req, res) => {
    try {
        const schema = Joi.object({
           roleid: Joi.number().required(),
           rolename: Joi.optional(),
           webpermissions: Joi.array().required()
         })   
        const validationResult = schema.validate(req.body)

        if(!_.isEmpty(validationResult.error)){
            return res.send({
                status: false,
                message: `${validationResult.error.details[0].message}`
            })
        }
        else {
            const response = await service.editRolePermssion(req.body)
            if (!_.isNull(response)) {
                return res.send({
                    status : true,
                    message : "role updated successfully!"
                })
            }
        }
    } catch (err) {
        console.log(err);
        return res.send({
            status: false,
            message : "Internal Server Error!"
        })
    }
    return res.send({
        status : false,
        message : "failed to update role!"
    })
};

module.exports.getRolePermission = async(req, res) => {
    try {
        const response = await service.getRolePermission(req.body)
        if (!_.isEmpty(response)) {
            return res.send({
                status : true,
                message : "success",
                response: response
            })
        }
        else {
            return res.send({
                status : true,
                message : "success",
                response: []
            })
        }
    } catch (err) {
        console.log(err);
    }
    return res.send({
        status : false,
        message : "failed"
   })
};