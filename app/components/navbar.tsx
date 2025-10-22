"use client"

import { Link, Outlet } from "react-router"
import Button from "./custom-components/button"

export default function () {
    return (
        <header className="flex justify-between items-center px-8 py-4 shadow-sm bg-white sticky top-0 z-50">
            <h1>
                <Link to="/" className="text-2xl font-bold text-gray-800">ShopEase</Link>
            </h1>
            <nav className="space-x-6 hidden md:block">
                <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
                <Link to="/products" className="text-gray-600 hover:text-gray-900">Products</Link>
                <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
                <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
                Shop Now
            </Button>
        </header>
    )
}