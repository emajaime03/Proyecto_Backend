import { isValidObjectId } from "mongoose"
import { cartsService } from "../services/carts.service.js"
import { ticketsService } from "../services/tickets.service.js"
import { productsService } from "../services/products.service.js"
import { ERRORS } from "../utils/EErrors.js"
import CustomError from "../utils/CustomError.js"
import { invalidId } from "../utils/info.js"
import { generateAddProductCartErrorInfo, generateOrderErrorInfo } from '../utils/info.js'
import { logger } from "../utils/Logger.js"
import { sendMail } from '../utils.js';

export default class CartsController {

    static getAllCarts = async (req, res) => {
        try {
            let carts = await cartsService.getAllCarts()
            res.setHeader('Content-Type', 'application/json')
            res.status(200).json({ carts })
        } catch (error) {
            CustomError.createError({ name: 'Error', cause: error, message: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, code: ERRORS.INTERNAL_SERVER_ERROR })
        }
    }

    static getCartById = async (req, res) => {
        try {
            let cartId = req.params.cid
            if (!isValidObjectId(cartId)) {
                CustomError.createError({ name: 'Error', cause: invalidId(cartId), message: "El id ingresado no tiene el formato correcto", code: ERRORS.BAD_REQUEST })
            }

            let cart = await cartsService.getCartById(cartId)
            res.setHeader('Content-Type', 'application/json')
            return res.status(200).json({ cart })
        } catch (error) {
            CustomError.createError({ name: 'Error', cause: error, message: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, code: ERRORS.INTERNAL_SERVER_ERROR })
        }
    }

    static createCart = async (req, res) => {
        try {
            let newCart = cartsService.createCart()
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({ newCart });
        } catch (error) {
            CustomError.createError({ name: 'Error', cause: error, message: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, code: ERRORS.INTERNAL_SERVER_ERROR })
        }
    }

    static addProduct = async (req, res) => {

        try {
            let cartId = req.params.cid
            let productId = req.params.pid
            if (!isValidObjectId(cartId) || !isValidObjectId(productId)) {
                CustomError.createError({ name: 'Error', cause: invalidId(cartId), message: "El id ingresado no tiene el formato correcto", code: ERRORS.BAD_REQUEST })
            }

            let productExists = await productsService.getProductById(productId)

            if (!productExists) {
                CustomError.createError({ name: 'Error', cause: generateAddProductCartErrorInfo(), message: "El producto seleccionado no existe o no tiene stock suficiente.", code: ERRORS.BAD_REQUEST })
            } else if (productExists.stock === 0) {
                CustomError.createError({ name: 'Error', cause: generateAddProductCartErrorInfo(), message: "El producto seleccionado no tiene stock suficiente.", code: ERRORS.BAD_REQUEST })
            }

            if (productExists.owner._id.toString() === req.session.user._id) {
                CustomError.createError({ name: 'Error', cause: "No puede agregar sus propios productos al carrito.", message: "No puedes agregar tus propios productos al carrito.", code: ERRORS.BAD_REQUEST })
            }

            let cart = await cartsService.getCartById(cartId)

            if (!cart) {
                CustomError.createError({ name: 'Error', cause: 'No se encontró ningún carrito con ese ID', message: "No se encontró ningún carrito con ese ID", code: ERRORS.BAD_REQUEST })
            }

            if (cart.products.find(p => p.product._id == productId)) {
                cart.products = cart.products.map(p => {
                    if (p.product._id == productId) {
                        p.quantity++
                    }
                    return p
                })
            }
            else {
                cart.products.push({ product: productId, quantity: 1 })
            }

            let newCart = await cartsService.updateCart(cartId, cart)
            res.setHeader('Content-Type', 'application/json')
            return res.status(200).json({ newCart })
        } catch (error) {
            CustomError.createError({ name: 'Error', cause: error, message: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, code: ERRORS.INTERNAL_SERVER_ERROR })
        }
    }

    static deleteProduct = async (req, res) => {
        try {
            let cartId = req.params.cid
            let productId = req.params.pid
            if (!isValidObjectId(cartId) || !isValidObjectId(productId)) {
                CustomError.createError({ name: 'Error', cause: invalidId(cartId), message: "El id ingresado no tiene el formato correcto", code: ERRORS.BAD_REQUEST })
            }

            let cart = await cartsService.getCartById(cartId)

            if (!cart) {
                CustomError.createError({ name: 'Error', cause: 'No se encontró ningún carrito con ese ID', message: "No se encontró ningún carrito con ese ID", code: ERRORS.BAD_REQUEST })
            }
            cart.products = cart.products.filter(p => p.product._id != productId)

            let newCart = await cartsService.updateCart(cartId, cart)
            res.setHeader('Content-Type', 'application/json')
            return res.status(200).json({ newCart })
        } catch (error) {
            CustomError.createError({ name: 'Error', cause: error, message: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, code: ERRORS.INTERNAL_SERVER_ERROR })
        }
    }

    static deleteAllProducts = async (req, res) => {
        try {
            let cartId = req.params.cid
            if (!isValidObjectId(cartId)) {
                CustomError.createError({ name: 'Error', cause: invalidId(cartId), message: "El id ingresado no tiene el formato correcto", code: ERRORS.BAD_REQUEST })
            }

            let cart = await cartsService.getCartById(cartId)

            if (!cart) {
                CustomError.createError({ name: 'Error', cause: 'No se encontró ningún carrito con ese ID', message: "No se encontró ningún carrito con ese ID", code: ERRORS.BAD_REQUEST })
            }

            cart.products = []
            cart = await cartsService.updateCart(cartId, cart)
            res.setHeader('Content-Type', 'application/json')
            return res.status(200).json({ cart })
        } catch (error) {
            CustomError.createError({ name: 'Error', cause: error, message: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, code: ERRORS.INTERNAL_SERVER_ERROR })
        }
    }

    static purchase = async (req, res) => {
        try {
            let cartId = req.params.cid
            if (!isValidObjectId(cartId)) {
                CustomError.createError({ name: 'Error', cause: invalidId(cartId), message: "El id ingresado no tiene el formato correcto", code: ERRORS.BAD_REQUEST })
            }

            let cart = await cartsService.getCartById(cartId)
            if (!cart) {
                CustomError.createError({ name: 'Error', cause: 'No se encontró ningún carrito con ese ID', message: "No se encontró ningún carrito con ese ID", code: ERRORS.BAD_REQUEST })
            }

            if (cart.products.length === 0) {
                CustomError.createError({ name: 'Error', cause: 'No hay productos en el carrito', message: "No hay productos en el carrito", code: ERRORS.BAD_REQUEST })
            }

            let productsAvailableForPurchase = cart.products.filter(p => p.product.stock >= p.quantity)

            let productsUnavailableForPurchase = cart.products.filter(p => p.product.stock < p.quantity)

            if(productsAvailableForPurchase.length === 0){
                CustomError.createError({ name: 'Error', cause: generateOrderErrorInfo(), message: "No se pudo completar la orden.", code: ERRORS.BAD_REQUEST })
            }

            for (let p of productsAvailableForPurchase) {
                p.product.stock -= p.quantity
                await productsService.update(p.product._id, p.product)
            }

            if (productsUnavailableForPurchase.length === 0) {
                cart.products = []
            } else {
                cart.products = productsUnavailableForPurchase
            }
            await cartsService.updateCart(cartId, cart)

            let newTicket = {
                purchaser: req.session.user.email,
                amount: productsAvailableForPurchase.reduce((acc, p) => acc + p.product.price * p.quantity, 0),
                code: Math.floor(Math.random() * 1000000)
            }

            let ticket = await ticketsService.createTicket(newTicket)
            await sendMail(req.session.user.email, 'Compra exitosa', `Compra exitosa, su código de compra es: ${ticket.code}`);
            logger.info(`Compra exitosa para ${req.session.user.last_name}`)
            res.setHeader('Content-Type', 'application/json')
            return res.status(200).json({ ticket, productsUnavailableForPurchase })
            
        } catch (error) {
            CustomError.createError({ name: 'Error', cause: error, message: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, code: ERRORS.INTERNAL_SERVER_ERROR })
        }
    }
}