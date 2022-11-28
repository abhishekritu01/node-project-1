const Order = require('../../../models/order')
const moment = require('moment')
// const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
function orderController() {
    return {
        store(req, res) {
            // Validate request
            const { phone, address, stripeToken, paymentType } = req.body
            if (!phone || !address) {
                req.flash('error', "All feilds are required")
                // return res.status(422).json({ message: 'All fields are required' });
                return res.redirect('/cart')
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })

            order.save().then(result => {
                Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
                    req.flash('success', "Order Place successfully")
                    delete req.session.cart

                    // Emit event 
                    const eventEmitter = req.app.get('eventEmitter')
                    eventEmitter.emit('orderPlaced', placedOrder)
                    return res.redirect('/admin/orders')
                })

            }).catch(err => {
                req.flash('error', 'somthing went wrong')
                return res.redirect('/cart')
            })
        },


        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id },
                null,
                { sort: { 'createdAt': -1 } })
            res.header('Cache-Control', 'no-store')
            res.render('customers/orders', { orders: orders, moment: moment })
        },

        async show(req, res) {
            const order = await Order.findById(req.params.id)
            // Authorize user
            if (req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', { order })
            }
            return res.redirect('/')
        }
    }
}

module.exports = orderController