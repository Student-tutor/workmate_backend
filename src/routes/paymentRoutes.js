import express from 'express'
const router = express.Router()

import { 
    paymentForm, getPaymentDetails, receiptPage, allUserPayment 
} from '../controllers/paymentController'


router.post('/pay', paymentForm); 
router.get('/callback', getPaymentDetails); 
router.get('/receipt/:id', receiptPage); 
router.get('/',  allUserPayment); 

export default router;