import request from 'request';
import Payment from '../models/paymentModel'
import Project from '../models/projectModel';
import _ from 'lodash';
import dotEnv from 'dotenv';
dotEnv.config()

// import { paystack } from '../config/paystack';

// const {
// initializePayment,
// verifyPayment
// } = paystack

// const paystack = (request) => {
 const MySecretKey = `Bearer ${process.env.PAYSTACK_SECRETE}`;

     const initializePayment = (form, mycallback) => {
        const option = {
            url : 'https://api.paystack.co/transaction/initialize',
            headers : {
                authorization: MySecretKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
           },
           form
        }
        const callback = (error, response, body)=>{
            return mycallback(error, body);
        }
        request.post(option, callback);
    }
    
    const verifyPayment = (ref, mycallback) => {
        const option = {
            url : 'https://api.paystack.co/transaction/verify/' + encodeURIComponent(ref),
            headers : {
                authorization: MySecretKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
           }
        }
        const callback = (error, response, body)=>{
            return mycallback(error, body);
        }
        request(option, callback);
    }
    // return {initializePayment, verifyPayment};
// }

export const allUserPayment = (req, res) => {
    // Payment.find()
    // .populate("projects")
    // .then(payments => res.status(200).json(payments))
    // .catch(err => res.json(err))

    Payment.find({})
       .populate('paidProject')
       .exec(function(error, payments) {
        console.log(JSON.stringify(payments, null, "\t"))
        })
}

export const userPayment = (req, res) => {
    const projectId = req.params.id
    Payment.findById(projectId)
    .populate("projects")
    .then(payments => res.status(200).json(payments))
    .catch(err => res.json(err))
}

export const paymentForm = (req, res) => {
    // let userEmail = "email"
    const form = _.pick(req.body,["amount", "email", "full_name"]);
    form.metadata = {
        full_name : form.full_name
    }
    form.amount *= 100;
    initializePayment(form, (error, body)=>{
        if(error){
            //handle errors
            console.log(error);
            return;
       }
       const payment = JSON.parse(body);
    //    let authUrl = response.data.authorization_url
       res.status(200).json({
        message: 'payment payload',
        payment
    })
    //    res.redirect(response.data.authorization_url)
    });
}

export const getPaymentDetails = (req, res) => {
        const ref = req.query.reference;
        verifyPayment(ref, (error, body)=>{
            if(error){
                console.log(error)
                return res.json(error)
                // return res.redirect('/error');
            }
            const response = JSON.parse(body);
            console.log("SUCCESS")
            console.log(response) 
            const data = _.at(response.data, ['reference', 'amount','customer.email', 'metadata.full_name']);
            const [reference, amount, email, full_name] = data;
            const newPayment = {
                reference, 
                amount, 
                email, 
                full_name,
                paidProject: Project._id,
            }
            
            const payment = new Payment(newPayment)
            //  const paymentId =  payment.paidProject
                payment.save().then((payment) =>{
                    // const project = Project.findById({_id: payment.paidProject})
                    // project.paymentDetails.push(payment)
                    // updatedProject.save()
                    res.status(200).json(payment)
                    if (!error) {
                        Payment.find({})
                            .populate('paidProject')
                            .exec(function(error, payments) {
                                console.log(JSON.stringify(payments, null, "\t"))
                            })
                    }
                }).catch(err => res.json(err))
                // payment.paidProject = project._id; 
        })

}

export const receiptPage = () => {
    const id = req.params.id;
    Payment.findById(id).then((payment)=>{
        if(!payment){
            //handle error when the donor is not found
            // res.redirect('/error')
            res.json("Error not geting reciept!")
        }
        // res.render('success.pug',{donor});
        res.status(200).json({
            message: "Reciept succesfully generated",
            payment
        })
    }).catch((err)=>{
        res.json(err)
    });
}