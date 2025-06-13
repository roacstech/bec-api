const _ = require("lodash");
// const db = global.dbConnection;


//modules

// module.exports.addModuleWithSubModuleSection = async (props) => {
//     const { moduleid, modulename, create, read, update, remove, modulesection, submodule } = props;
//     try {
//         // Insert module
//         const response = await db("web_module").insert({
//             moduleid: moduleid,
//             modulename: modulename,
//             create: create,
//             read: read,
//             update: update,
//             remove: remove
//         });

//         // Insert module sections
//         if (modulesection && modulesection.length > 0) {
//             const moduleSections = modulesection.map((module) => ({
//                 moduleid: module.moduleid,
//                 sectionname: module.sectionname,
//                 create: module.create,
//                 read: module.read,
//                 update: module.update,
//                 remove: module.remove
//             }));
//             await db("web_section").insert(moduleSections);
//         }

//         // Insert submodules and their sections
//         if (submodule && submodule.length > 0) {
//             const subModules = submodule.map((sub) => ({
//                 submoduleid: sub.submoduleid,
//                 moduleid: moduleid,
//                 submodulename: sub.submodulename,
//                 create: sub.create,
//                 read: sub.read,
//                 update: sub.update,
//                 remove: sub.remove
//             }));
//             await db("web_submodule").insert(subModules);

//             const subModuleSections = submodule.flatMap((sub) =>
//                 sub.submodulesection ? sub.submodulesection.map((subsection) => ({
//                     submoduleid: subsection.submoduleid,
//                     sectionname: subsection.sectionname,
//                     create: subsection.create,
//                     read: subsection.read,
//                     update: subsection.update,
//                     remove: subsection.remove
//                 })) : []
//             );
//             if (subModuleSections.length > 0) {
//                 await db("web_section").insert(subModuleSections);
//             }
//         }

//         return !_.isEmpty(response) ? response : null;
//     } catch (err) {
//         console.error(err);
//         return null;
//     }
// };

// module.exports.addModule = async(props) => {
//     const { moduleid, modulename, modulesection, modulestatus } = props
//     try {
//         const response = await db("web_module")
//         .insert({
//             moduleid: moduleid,
//             modulename: modulename,
//             modulestatus: modulestatus
//         })

//         // const mapModuleSection = await Promise.all(modulesection.map(async(section) => {
//         //     return {
//         //         moduleid: section.moduleid,
//         //         sectionid: section.sectionid,
//         //         sectionname: section.sectionname,
//         //         sectionstatus: section.sectionstatus
//         //     }
//         // }))

//         // const addModuleSection = await db("web_section")
//         // .insert(mapModuleSection)


//         return !_.isEmpty(response) ? response : null;
//     } catch (err) {
//         console.log(err);
//     }
//     return null;
// };

module.exports.getModule = async (props) => {
    const { moduleid } = props;
    try {
        let response;
        if (moduleid) {
            response = await db("web_module")
                .select(
                    "web_module.moduleid",
                    "web_module.modulename",
                    db.raw("web_module.modulestatus = 1 as modulestatus") // Convert modulestatus to boolean
                )
                .where("web_module.moduleid", moduleid)
                .first(); // Assuming you expect only one module with moduleid
        } else {
            response = await db("web_module")
                .select(
                    "web_module.moduleid",
                    "web_module.modulename",
                    db.raw("web_module.modulestatus = 1 as modulestatus") // Convert modulestatus to boolean
                )
                .first(); // Assuming you expect only one module without moduleid condition
        }

        return response ? {
            moduleid: response.moduleid,
            modulename: response.modulename,
            modulestatus: response.modulestatus === 1 // Convert 1/0 to true/false
        } : null;

    } catch (err) {
        console.log(err);
        return null;
    }
};


// module.exports.editModule = async(props) => {
//     const { moduleid, modulename, create, read, update, remove, modulesection } = props
//     try {
//         const response = await db("web_module")
//         .update({
//             modulename: modulename,
//             create: create,
//             read: read,
//             update: update,
//             remove: remove
//         })
//         .where({
//             moduleid: moduleid
//         })



//         const mapModuleSection = await Promise.all(modulesection.map(async(section) => {
//             return {
//                 moduleid: section.moduleid,
//                 sectionname: section.sectionname,
//                 create : section.create,
//                 read: section.read, 
//                 update: section.update,
//                 remove: section.remove
//             }
//         }))

//         const addModuleSection = await db("web_section")
//         .insert(mapModuleSection)



//         return !_.isNull(response) ? response : null;
//     } catch (err) {
//         console.log(err);
//     }
//     return null;
// };

module.exports.getModuleWithSubmodule = async (props) => {
    const { moduleid, submoduleid } = props;
    const db = global.dbConnection;

    try {
        let response;
        if (moduleid && submoduleid) {
            // Fetch a specific submodule under a specific module
            response = await db("web_module")
                .select(
                    "web_module.moduleid",
                    "web_module.modulename",
                    "web_module.modulestatus"
                )
                .where("web_module.moduleid", moduleid);

            await Promise.all(response.map(async (sub) => {
                const submodule = await db("web_submodule")
                    .select(
                        "web_submodule.submoduleid",
                        "web_submodule.submodulename",
                        "web_submodule.submodulestatus"
                    )
                    .where("web_submodule.moduleid", sub.moduleid)
                    .andWhere("web_submodule.submoduleid", submoduleid)
                    .first(); // Assuming submoduleid uniquely identifies a submodule
                sub.submodule = submodule ? [submodule] : []; // Convert to array or empty array
            }));

        } else if (moduleid) {
            // Fetch all submodules under a specific module
            response = await db("web_module")
                .select(
                    "web_module.moduleid",
                    "web_module.modulename",
                    "web_module.modulestatus"
                )
                .where("web_module.moduleid", moduleid);

            await Promise.all(response.map(async (sub) => {
                const submodule = await db("web_submodule")
                    .select(
                        "web_submodule.submoduleid",
                        "web_submodule.submodulename",
                        "web_submodule.submodulestatus"
                    )
                    .where("web_submodule.moduleid", sub.moduleid);
                sub.submodule = submodule ? submodule : []; // Convert to array or empty array
            }));

        } else {
            console.log("else working");

            // Fetch all modules and their submodules
            response = await db("web_module")
                .select(
                    "web_module.moduleid",
                    "web_module.modulename",
                    "web_module.modulestatus"
                );

            await Promise.all(response.map(async (sub) => {
                const submodule = await db("web_submodule")
                    .select(
                        "web_submodule.submoduleid",
                        "web_submodule.submodulename",
                        "web_submodule.submodulestatus"
                    )
                    .where("web_submodule.moduleid", sub.moduleid);
                sub.submodule = submodule ? submodule : []; // Convert to array or empty array
            }));
        }

        // Convert modulestatus and submodulestatus to boolean explicitly
        response.forEach(module => {
            module.modulestatus = !!module.modulestatus; // Convert to boolean
            module.submodule.forEach(submodule => {
                submodule.submodulestatus = !!submodule.submodulestatus; // Convert to boolean
            });
        });

        return !_.isEmpty(response) ? response : null;

    } catch (err) {
        console.log(err);
        return null;
    }
};


// module.exports.addSubModule = async(props) => {
//     const { moduleid, submoduleid, submodulename, submodulesection, submodulestatus } = props 
//     try {
//         const response = await db("web_submodule")
//         .insert({
//             moduleid: moduleid,
//             submoduleid: submoduleid,
//             submodulename : submodulename,
//             submodulestatus: submodulestatus
//         })

//         const mapSubModuleSection = await Promise.all(submodulesection.map(async(section) => {
//             return {
//                 submoduleid: section.submoduleid,
//                 moduleid: section.moduleid,
//                 sectionname: section.sectionname,
//                 sectionstatus: section.sectionstatus
//             }
//         }))

//         const addSubModuleSection = await db("web_section")
//         .insert(mapSubModuleSection)

//         return !_.isEmpty(response) ? response  : null;  
//     } catch (err) {
//         console.log(err);
//     }
// };

// module.exports.getAllModulesandSubmoduleSection = async (props) => {
//     const { moduleid, submoduleid } = props;
//     try {
//         let response;
//         if (moduleid && submoduleid) {
//             // Fetch a specific submodule under a specific module
//             response = await db("web_module")
//                 .select(
//                     "web_module.moduleid",
//                     "web_module.modulename",
//                     db.raw("web_module.modulestatus = 1 as modulestatus") // Convert modulestatus to boolean
//                 )
//                 .where("web_module.moduleid", moduleid);

//             await Promise.all(response.map(async (module) => {
//                 const modulesections = await db("web_section")
//                     .select(
//                         "web_section.sectionid",
//                         "web_section.sectionname",
//                         db.raw("web_section.sectionstatus = 1 as sectionstatus") // Convert sectionstatus to boolean
//                     )
//                     .where("web_section.moduleid", module.moduleid);

//                 module.modulesections = modulesections || [];

//                 const submodules = await db("web_submodule")
//                     .select(
//                         "web_submodule.submoduleid",
//                         "web_submodule.websubmoduleid",
//                         "web_submodule.submodulename",
//                         db.raw("web_submodule.submodulestatus = 1 as submodulestatus") // Convert submodulestatus to boolean
//                     )
//                     .where("web_submodule.moduleid", module.moduleid)
//                     .andWhere("web_submodule.submoduleid", submoduleid);

//                 await Promise.all(submodules.map(async (submodule) => {
//                     const submodulesections = await db("web_section")
//                         .select(
//                             "web_section.sectionid",
//                             "web_section.sectionname",
//                             db.raw("web_section.sectionstatus = 1 as sectionstatus") // Convert sectionstatus to boolean
//                         )
//                         .where("web_section.submoduleid", submodule.websubmoduleid);

//                     submodule.submodulesections = submodulesections || [];
//                 }));

//                 module.submodules = submodules || [];
//             }));

//         } else if (moduleid) {
//             // Fetch all submodules under a specific module
//             response = await db("web_module")
//                 .select(
//                     "web_module.moduleid",
//                     "web_module.modulename",
//                     db.raw("web_module.modulestatus = 1 as modulestatus") // Convert modulestatus to boolean
//                 )
//                 .where("web_module.moduleid", moduleid);

//             await Promise.all(response.map(async (module) => {
//                 const modulesections = await db("web_section")
//                     .select(
//                         "web_section.sectionid",
//                         "web_section.sectionname",
//                         db.raw("web_section.sectionstatus = 1 as sectionstatus") // Convert sectionstatus to boolean
//                     )
//                     .where("web_section.moduleid", module.moduleid);

//                 module.modulesections = modulesections || [];

//                 const submodules = await db("web_submodule")
//                     .select(
//                         "web_submodule.websubmoduleid",
//                         "web_submodule.submoduleid",
//                         "web_submodule.submodulename",
//                         db.raw("web_submodule.submodulestatus = 1 as submodulestatus") // Convert submodulestatus to boolean
//                     )
//                     .where("web_submodule.moduleid", module.moduleid);

//                 await Promise.all(submodules.map(async (submodule) => {
//                     const submodulesections = await db("web_section")
//                         .select(
//                             "web_section.sectionid",
//                             "web_section.sectionname",
//                             db.raw("web_section.sectionstatus = 1 as sectionstatus") // Convert sectionstatus to boolean
//                         )
//                         .where("web_section.submoduleid", submodule.websubmoduleid);

//                     submodule.submodulesections = submodulesections || [];
//                 }));

//                 module.submodules = submodules || [];
//             }));

//         } 
//         else {
//             // Fetch all modules and their submodules
//             response = await db("web_module")
//                 .select(
//                     "web_module.moduleid",
//                     "web_module.modulename",
//                     db.raw("web_module.modulestatus = 1 as modulestatus") // Convert modulestatus to boolean
//                 );

//             await Promise.all(response.map(async (module) => {
//                 const modulesections = await db("web_section")
//                     .select(
//                         "web_section.sectionid",
//                         "web_section.sectionname",
//                         db.raw("web_section.sectionstatus = 1 as sectionstatus") // Convert sectionstatus to boolean
//                     )
//                     .where("web_section.moduleid", module.moduleid);

//                 module.modulesections = modulesections || [];

//                 const submodules = await db("web_submodule")
//                     .select(
//                         "web_submodule.websubmoduleid",
//                         "web_submodule.submoduleid",
//                         "web_submodule.submodulename",
//                         db.raw("web_submodule.submodulestatus = 1 as submodulestatus") // Convert submodulestatus to boolean
//                     )
//                     .where("web_submodule.moduleid", module.moduleid);

//                 await Promise.all(submodules.map(async (submodule) => {
//                     const submodulesections = await db("web_section")
//                         .select(
//                             "web_section.sectionid",
//                             "web_section.sectionname",
//                             db.raw("web_section.sectionstatus = 1 as sectionstatus") // Convert sectionstatus to boolean
//                         )
//                         .where("web_section.submoduleid", submodule.websubmoduleid);

//                     submodule.submodulesections = submodulesections || [];
//                 }));

//                 module.submodules = submodules || [];
//             }));
//         }
//         // Convert modulestatus, submodulestatus, and sectionstatus to boolean explicitly
//         response.forEach(module => {
//             module.modulestatus = !!module.modulestatus; // Convert to boolean
//             module.modulesections.forEach(section => {
//                 section.sectionstatus = !!section.sectionstatus; // Convert to boolean
//             });
//             module.submodules.forEach(submodule => {
//                 submodule.submodulestatus = !!submodule.submodulestatus; // Convert to boolean
//                 submodule.submodulesections.forEach(section => {
//                     section.sectionstatus = !!section.sectionstatus; // Convert to boolean
//                 });
//             });
//         });

//         return !_.isEmpty(response) ? response : null;

//     } catch (err) {
//         console.log(err);
//         return null;
//     }
// };



//Roles and Permssions
module.exports.addRolePermission = async (props) => {
    const { rolename, webpermissions } = props
    try {
        const webpermission = JSON.stringify(webpermissions);

        const response = await db("roles")
            .insert({
                rolename: rolename,
                webpermissions: webpermission
            })
        return !_.isEmpty(response) ? response : null;
    } catch (err) {
        console.log(err);
    }
    return null;
};

module.exports.editRolePermssion = async (props) => {
    const { roleid, rolename, webpermissions } = props
    const db = global.dbConnection;

    try {
        const webpermission = JSON.stringify(webpermissions);

        const response = await db("roles")
            .update({
                rolename: rolename,
                webpermissions: webpermission,
            })
            .where({
                roleid: roleid
            })
        return !_.isNull(response) ? response : null;
    } catch (err) {
        console.log(err);
    }
    return null;
};

module.exports.getRolePermission = async (props) => {
    const db = global.dbConnection;
    const { roleid } = props
    try {
        if (roleid) {
            const allroles = await db("roles")
                .select(
                    'roles.roleid',
                    'roles.rolename',
                    'roles.webpermissions'
                )
                .where("roles.roleid", roleid)
            if (!_.isEmpty(allroles)) {
                allroles.forEach(role => {
                    role.webpermissions = JSON.parse(role.webpermissions)
                });
            }
            else {
                return null
            }
            return !_.isEmpty(allroles) ? allroles : null
        }
        else {
            const allroles = await db("roles")
                .select(
                    'roles.roleid',
                    'roles.rolename',
                    'roles.webpermissions'
                )
            if (!_.isEmpty(allroles)) {
                allroles.forEach(role => {
                    role.webpermissions = JSON.parse(role.webpermissions)
                });
            }
            else {
                return null
            }
            return !_.isEmpty(allroles) ? allroles : null
        }
    } catch (err) {
        console.log(err);
    }
    return null;
}