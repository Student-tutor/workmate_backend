import Project from '../models/projectModel';
import {sendEmail} from "../middelwares/projectNotification"

export const getProjects = (req, res, next) => {
    Project.find()
    .then((projects) => {
        res.status(200).json({
            message: 'all projects',
            projects,
        })
    })
    .catch(err => {
        res.json(err)
    })
}
export const getProjectsWithPayments = (req, res, next) => {
    Project.find({paymentId: req.payment._id})
    .populate("Payment")
    .then((projects) => {
        res.status(200).json({
            message: 'all projects',
            projects,
        })
    })
    .catch(err => {
        res.json(err)
    })
}

export const postProject = async (req, res) => {
// console.log(req.body)

    const {
        title, type, content, pages, phoneNumber, email, submissionDate, file,
    } = req.body

    const newProject = new Project({
        title, 
        type, 
        content,
        pages, 
        phoneNumber,
        email,
        submissionDate, 
        file,
        // isPaid: false,
        userId: req.user['https://api.examplezeeson.com/email']
    })
     // Associate the project entry with the current user
  let userId = req.user['https://api.examplezeeson.com/email'];
  newProject.user_id = userId;
  
   console.log(userId)
   console.log(newProject.user_id)

   await newProject.save().then((project) => {
        console.log(project)
        return res.status(200).json({
            message: 'Submission is succesfful. You can contact +2348068773801 on WhatsApp for speedy attention',
            project
        })
    }).catch((err) => {
        res.status(400).json(err)
    })

     await sendEmail(userId, phoneNumber, function(err, data) {
        if (err) {
            res.status(500).json({ message: 'Internal Error' });
            console.log("Failure")
        } else {
            res.status({ message: 'Email sent!!!' });
            console.log("Success")
        }
    });
}

export const getUserProjects = (req, res, next) => {
    let userId = req.user['https://api.examplezeeson.com/email'];
    Project.find({userId})
    .then((projects) => {
        res.status(200).json({
            message: 'user projects',
            projects
        })
    })
    .catch(err => {
        res.json(err)
    })

}
export const showProject = (req, res, next) => {
    Project.findById(req.params.id).then(project =>{
        res.status(200).json(project)
    }).catch(err => {
        res.status(400).json(err)
    })
}

export const editProject = (req, res, next) => {
    Project.findById(req.params.id, (err, foundProject) =>{
        if(err){
            res.json(err)
        } else{
            res.status(200).json(foundProject)
        }
    })
}

export const updateProject = (req, res) => {
    const {title, type, content, pages, phoneNumber, email, submissionDate, file, 
    } = req.body

    Project.findById(req.params.id).then(project => {
        project.title = title
        project.type = type
        project.pages = pages
        project.submissionDate = submissionDate
        project.phoneNumber = phoneNumber
        project.content = content
        project.email = email
        project.file = file

        project.save().then((updatedProject) => { 
            res.status(200).json(updatedProject)
        })
    }).catch(err => {
        res.status(400).json(err)
    })
}

export const deleteProject = (req, res,next) => {
    Project.findByIdAndRemove(req.params.id).then(() => {
        res.status(200).json("Project Deleted")
    }).catch(err => {
        res.status(400).json(err)
    })
}



export const updatePayment = (req, res) => {
    const {title, type, content, pages, phoneNumber, email, submissionDate, file, isPaid,
    } = req.body

    Project.findById(req.params.id).then(project => {
        project.title = title
        project.type = type
        project.pages = pages
        project.submissionDate = submissionDate
        project.phoneNumber = phoneNumber
        project.content = content
        project.email = email
        project.file = file
        project.isPaid = isPaid

        project.save().then((updatedProject) => { 
            res.status(200).json(updatedProject)
        })
    }).catch(err => {
        res.status(400).json(err)
    })
}