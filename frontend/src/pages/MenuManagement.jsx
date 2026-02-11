import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { menuItemService } from '../services/menuItemService'
import { imgbbService } from '../services/imgbbService'
import canteenAuthService from '../services/canteenAuthService'

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Other']

function MenuManagement() {
    const [menuItems, setMenuItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [canteenOwner, setCanteenOwner] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Lunch',
        imageUrl: '',
        available: true,
        vegetarian: false
    })

    const navigate = useNavigate()

    useEffect(() => {
        const owner = canteenAuthService.getCurrentCanteenOwner()
        if (!owner) {
            navigate('/canteen/login')
            return
        }
        setCanteenOwner(owner)
        fetchMenuItems(owner.canteenId)
    }, [navigate])

    const fetchMenuItems = async (canteenId) => {
        try {
            const data = await menuItemService.getMenuItems(canteenId)
            setMenuItems(data)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching menu items:', err)
            setError('Failed to load menu items.')
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)
        setError(null)
        try {
            const url = await imgbbService.uploadImage(file)
            setFormData(prev => ({ ...prev, imageUrl: url }))
            setSuccess('Image uploaded successfully!')
        } catch (err) {
            setError('Failed to upload image. Please check your API key.')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        const itemToSave = {
            ...formData,
            canteenId: canteenOwner.canteenId,
            price: parseFloat(formData.price)
        }

        try {
            if (editingItem) {
                await menuItemService.updateMenuItem(editingItem.id, itemToSave)
                setSuccess('Item updated successfully!')
            } else {
                await menuItemService.createMenuItem(itemToSave)
                setSuccess('Item added successfully!')
            }
            setShowForm(false)
            setEditingItem(null)
            resetForm()
            fetchMenuItems(canteenOwner.canteenId)
        } catch (err) {
            setError('Failed to save menu item.')
        }
    }

    const handleEdit = (item) => {
        setEditingItem(item)
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            imageUrl: item.imageUrl,
            available: item.available,
            vegetarian: item.vegetarian
        })
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return

        try {
            await menuItemService.deleteMenuItem(id)
            setSuccess('Item deleted successfully!')
            fetchMenuItems(canteenOwner.canteenId)
        } catch (err) {
            setError('Failed to delete item.')
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'Lunch',
            imageUrl: '',
            available: true,
            vegetarian: false
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <Link to="/canteen/dashboard" className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
                        <p className="text-gray-600">Manage your food items and pricing</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowForm(!showForm)
                            if (showForm) {
                                setEditingItem(null)
                                resetForm()
                            }
                        }}
                        className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-1 ${
                            showForm ? 'bg-gray-200 text-gray-800' : 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                        }`}
                    >
                        {showForm ? 'Cancel' : 'Add New Item'}
                    </button>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg animate-fade-in">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg animate-fade-in">
                        {success}
                    </div>
                )}

                {/* Add/Edit Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slide-down">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="e.g. Chicken Kottu"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none h-24"
                                        placeholder="Brief description of the dish"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Image</label>
                                    <div className="flex flex-col gap-4">
                                        {formData.imageUrl && (
                                            <div className="relative w-full h-40 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                                                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-md"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-center w-full">
                                            <label className={`w-full flex flex-col items-center px-4 py-6 bg-white rounded-xl shadow-md border-2 border-dashed border-gray-300 cursor-pointer hover:border-orange-500 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                {uploading ? (
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                                                ) : (
                                                    <>
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="mt-2 text-sm text-gray-500">Click to upload image</span>
                                                    </>
                                                )}
                                                <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} accept="image/*" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="vegetarian"
                                            checked={formData.vegetarian}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Vegetarian</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="available"
                                            checked={formData.available}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">In Stock</span>
                                    </label>
                                </div>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingItem(null)
                                        resetForm()
                                    }}
                                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-8 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 font-semibold shadow-md disabled:opacity-50"
                                >
                                    {editingItem ? 'Update Item' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Menu List */}
                {menuItems.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <div className="text-6xl mb-4">🍱</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No menu items yet</h2>
                        <p className="text-gray-600 mb-8">Start by adding your first food item to the menu!</p>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold shadow-lg transform hover:-translate-y-1 transition"
                            >
                                Add Your First Item
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {CATEGORIES.map(category => {
                            const items = menuItems.filter(item => item.category === category)
                            if (items.length === 0) return null

                            return (
                                <div key={category}>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-4 border-orange-200 inline-block pb-1">
                                        {category}
                                    </h3>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {items.map(item => (
                                            <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl transition">
                                                <div className="relative h-48 bg-gray-200 overflow-hidden">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                                                            {category === 'Beverages' ? '🥤' : '🍲'}
                                                        </div>
                                                    )}
                                                    {item.vegetarian && (
                                                        <div className="absolute top-4 left-4 bg-green-500 text-white p-1 rounded-md shadow-md" title="Vegetarian">
                                                            <div className="border border-white p-0.5 rounded-sm">
                                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {!item.available && (
                                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                            <span className="bg-white text-gray-900 px-4 py-1 rounded-full font-bold">Out of Stock</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-6">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-xl font-bold text-gray-900">{item.name}</h4>
                                                        <span className="text-xl font-bold text-orange-600">₹{item.price}</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MenuManagement
