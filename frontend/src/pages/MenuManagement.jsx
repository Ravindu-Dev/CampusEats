import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { menuItemService } from '../services/menuItemService'
import { imgbbService } from '../services/imgbbService'
import canteenAuthService from '../services/canteenAuthService'
import CanteenLayout from '../components/CanteenLayout'

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
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    return (
        <CanteenLayout pageTitle="Menu Management" pageSubtitle="Manage your food items and pricing">
            <div className="flex justify-end mb-8">
                <button
                    onClick={() => {
                        setShowForm(!showForm)
                        if (showForm) {
                            setEditingItem(null)
                            resetForm()
                        }
                    }}
                    className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-1 ${showForm ? 'bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.2)]' : 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_4px_14px_0_rgba(249,115,22,0.39)]'
                        }`}
                >
                    {showForm ? 'Cancel' : '+ Add New Item'}
                </button>
            </div>

            {/* Status Messages */}
            {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', borderLeft: '4px solid #ef4444', color: '#f87171' }} className="mb-6 p-4 rounded-lg animate-fade-in shadow-sm">
                    {error}
                </div>
            )}
            {success && (
                <div style={{ background: 'rgba(34,197,94,0.1)', borderLeft: '4px solid #22c55e', color: '#4ade80' }} className="mb-6 p-4 rounded-lg animate-fade-in shadow-sm">
                    {success}
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="rounded-2xl shadow-2xl p-8 mb-8 animate-slide-down">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }}></span>
                        {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Item Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    className="w-full px-4 py-2.5 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder-gray-600"
                                    placeholder="e.g. Chicken Kottu"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    className="w-full px-4 py-2.5 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none h-28 transition-all resize-none placeholder-gray-600"
                                    placeholder="Brief description of the dish"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Price (Rs.) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        required
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                        className="w-full px-4 py-2.5 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder-gray-600"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                        className="w-full px-4 py-2.5 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all [&>option]:bg-gray-900"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Item Image</label>
                                <div className="flex flex-col gap-4">
                                    {formData.imageUrl && (
                                        <div className="relative w-full h-40 bg-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
                                            <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                                className="absolute top-2 right-2 bg-red-600/80 backdrop-blur text-white p-1.5 rounded-full hover:bg-red-600 transition shadow-lg"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center w-full">
                                        <label style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.1)' }} className={`w-full flex flex-col items-center px-4 py-8 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-[rgba(255,255,255,0.04)] transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {uploading ? (
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                                            ) : (
                                                <>
                                                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="mt-2 text-sm text-gray-400">Click to upload image</span>
                                                </>
                                            )}
                                            <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="p-4 rounded-xl flex gap-8">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            name="vegetarian"
                                            checked={formData.vegetarian}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 appearance-none border-2 border-[rgba(255,255,255,0.2)] rounded bg-transparent checked:bg-green-500 checked:border-green-500 transition-colors"
                                        />
                                        <svg className={`absolute w-3 h-3 text-white pointer-events-none left-1 top-1 transition-opacity ${formData.vegetarian ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Vegetarian</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            name="available"
                                            checked={formData.available}
                                            onChange={handleInputChange}
                                            className="w-5 h-5 appearance-none border-2 border-[rgba(255,255,255,0.2)] rounded bg-transparent checked:bg-orange-500 checked:border-orange-500 transition-colors"
                                        />
                                        <svg className={`absolute w-3 h-3 text-white pointer-events-none left-1 top-1 transition-opacity ${formData.available ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">In Stock</span>
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-4 mt-6 pt-6 border-t border-[rgba(255,255,255,0.05)]">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingItem(null)
                                    resetForm()
                                }}
                                className="px-6 py-2.5 bg-[rgba(255,255,255,0.05)] text-gray-300 rounded-lg hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="px-8 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-500 hover:to-red-500 font-bold shadow-lg disabled:opacity-50 transition"
                            >
                                {editingItem ? 'Update Item' : 'Add Item'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Menu List */}
            {menuItems.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="rounded-2xl shadow-xl p-16 text-center mt-8">
                    <div className="text-6xl mb-6 opacity-50">🍱</div>
                    <h2 className="text-2xl font-bold text-white mb-2">No menu items yet</h2>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">Start building your menu by adding your first food item. Customers will be able to see and order these items.</p>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-8 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] transform hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)] transition"
                        >
                            + Add Your First Item
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
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span style={{ width: '4px', height: '24px', borderRadius: '4px', background: 'linear-gradient(to bottom, #ea580c, #dc2626)' }}></span>
                                    {category}
                                </h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 transform translate-z-0">
                                    {items.map(item => (
                                        <div key={item.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="rounded-2xl overflow-hidden group hover:bg-[rgba(255,255,255,0.04)] transition duration-300">
                                            <div className="relative h-48 bg-[rgba(255,255,255,0.02)] overflow-hidden border-b border-[rgba(255,255,255,0.05)]">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                                                        {category === 'Beverages' ? '🥤' : '🍲'}
                                                    </div>
                                                )}
                                                {item.vegetarian && (
                                                    <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur text-white p-1 rounded-md shadow-lg border border-green-400" title="Vegetarian">
                                                        <div className="border border-white p-0.5 rounded-sm">
                                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                                        </div>
                                                    </div>
                                                )}
                                                {!item.available && (
                                                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                                                        <span className="bg-white text-gray-900 px-4 py-1.5 rounded-full font-bold shadow-xl">Out of Stock</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-2 gap-4">
                                                    <h4 className="text-xl font-bold text-white leading-tight">{item.name}</h4>
                                                    <span className="text-xl font-bold text-orange-400">Rs.{item.price}</span>
                                                </div>
                                                <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">{item.description}</p>
                                                <div className="flex justify-end gap-2 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-2 text-blue-400 hover:text-white hover:bg-blue-500/20 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
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
        </CanteenLayout>
    )
}

export default MenuManagement
