import { isValidObjectId } from "mongoose"
import { cartsService } from "../services/carts.service.js"

export default class CartsController {

    static getAllCarts = async (req, res) => {
        try {
            let carts = await cartsService.getAllCarts()
            res.setHeader('Content-Type', 'application/json')
            res.status(200).json({ carts })
        } catch (error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json(
                {
                    error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                    detalle: `${error.message}`
                }
            )
        }
    }

    static getCartById = async (req, res) => {
        try {
            let cartId = req.params.cid
            if (!isValidObjectId(cartId)) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: `Ingrese un id de MongoDB válido` })
            }

            let cart = await cartsService.getCartById(cartId)
            res.setHeader('Content-Type', 'application/json')
            res.status(200).json({ cart })
        } catch (error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json(
                {
                    error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                    detalle: `${error.message}`
                }
            )
        }
    }

    static createCart = async (req, res) => {
        try {
            let newCart = cartsService.createCart()
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({ newCart });
        } catch (error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json(
                {
                    error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                    detalle: `${error.message}`
                }
            )
        }
    }

    static addProduct = async (req, res) => {

        let cartId = req.params.cid
        let productId = req.params.pid
        if (!isValidObjectId(cartId) || !isValidObjectId(productId)) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `Ingrese un id de MongoDB válido` })
        }

        try {
            let cart = await cartsService.getCartById(cartId)

            if (!cart) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: `No se encontró ningún carrito con ese ID` })
            }

            if (cart.products.find(p => p.product._id == productId)) {
                cart = newCart.products.map(p => {
                    if (p.product._id == productId) {
                        p.quantity++
                    }
                    return p
                })
            }
            else {
                cart.products.push({ product: productId, quantity: 1 })
            }

            let newCart = await cartsService.update(cartId, cart)
            res.setHeader('Content-Type', 'application/json')
            res.status(200).json({ newCart })
        } catch (error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json(
                {
                    error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                    detalle: `${error.message}`
                }
            )
        }
    }

    static deleteProduct = async (req, res) => {
        try {
            let cartId = req.params.cid
            let productId = req.params.pid
            if (!isValidObjectId(cartId) || !isValidObjectId(productId)) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: `Ingrese un id de MongoDB válido` })
            }

            let cart = await cartsService.getCartById(cartId)

            if (!cart) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: `No se encontró ningún carrito con ese ID` })
            }
            cart.products = cart.products.filter(p => p.product._id != productId)

            let newCart = await cartsService.update(cartId, cart)
            res.setHeader('Content-Type', 'application/json')
            res.status(200).json({ newCart })
        } catch (error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json(
                {
                    error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                    detalle: `${error.message}`
                }
            )
        }
    }

    static deleteAllProducts = async (req, res) => {
        try {
            let cartId = req.params.cid
            if (!isValidObjectId(cartId)) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: `Ingrese un id de MongoDB válido` })
            }

            let cart = await cartsService.getCartById(cartId)

            if (!cart) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: `No se encontró ningún carrito con ese ID` })
            }

            cart.products = []
            cart = await cartsService.update(cartId, cart)
            res.setHeader('Content-Type', 'application/json')
            res.status(200).json({ cart })
        } catch (error) {
            console.log(error);
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json(
                {
                    error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                    detalle: `${error.message}`
                }
            )
        }
    }
}