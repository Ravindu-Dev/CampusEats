import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { menuItemService } from '../services/menuItemService'
import comboDealService from '../services/comboDealService'
import canteenAuthService from '../services/canteenAuthService'
import CanteenLayout from '../components/CanteenLayout'

function ComboManagement() {
    const [comboDeals, setComboDeals] = useState([])
    const [menuItems, setMenuItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [canteenOwner, setCanteenOwner] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [editingDeal, setEditingDeal] = useState(null)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [selectedItems, setSelectedItems] = useState([])

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        category: 'Lunch Combo',
        comboPrice: '',
        minWeeklySpend: '5000',
        active: true
    })

    const COMBO_CATEGORIES = ['Breakfast Combo', 'Lunch Combo', 'Dinner Combo', 'Snack Combo', 'Beverage Combo', 'Special Combo']

    const navigate = useNavigate()

    useEffect(() => {
        const owner = canteenAuthService.getCurrentCanteenOwner()
        if (!owner) {
            navigate('/canteen/login')
            return
        }
        setCanteenOwner(owner)
        fetchData(owner.canteenId)
    }, [navigate])

    const fetchData = async (canteenId) => {
        try {
            const [deals, items] = await Promise.all([
                comboDealService.getCanteenComboDeals(canteenId),
                menuItemService.getMenuItems(canteenId)
            ])
            setComboDeals(deals)
            setMenuItems(items)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching data:', err)
            setError('Failed to load data.')
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

    const toggleItemSelection = (item) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i.menuItemId === item.id)
            if (existing) {
                return prev.filter(i => i.menuItemId !== item.id)
            }
            return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl }]
        })
    }

    const updateItemQuantity = (menuItemId, quantity) => {
        setSelectedItems(prev =>
            prev.map(i => i.menuItemId === menuItemId ? { ...i, quantity: Math.max(1, quantity) } : i)
        )
    }

    const originalTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const comboPrice = parseFloat(formData.comboPrice) || 0
    const savings = originalTotal - comboPrice
    const discountPercent = originalTotal > 0 ? ((savings / originalTotal) * 100).toFixed(1) : 0

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (selectedItems.length < 2) {
            setError('Please select at least 2 menu items for a combo deal.')
            return
        }

        if (comboPrice >= originalTotal) {
            setError('Combo price must be less than the sum of individual items (Rs. ' + originalTotal + ').')
            return
        }

        const dealData = {
            name: formData.name,
            description: formData.description,
            imageUrl: formData.imageUrl,
            category: formData.category,
            comboPrice: comboPrice,
            minWeeklySpend: parseFloat(formData.minWeeklySpend) || 5000,
            active: formData.active,
            items: selectedItems.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity }))
        }

        try {
            if (editingDeal) {
                await comboDealService.updateComboDeal(editingDeal.id, canteenOwner.canteenId, dealData)
                setSuccess('Combo deal updated successfully!')
            } else {
                await comboDealService.createComboDeal(canteenOwner.canteenId, dealData)
                setSuccess('Combo deal created successfully!')
            }
            setShowForm(false)
            setEditingDeal(null)
            resetForm()
            fetchData(canteenOwner.canteenId)
        } catch (err) {
            setError('Failed to save combo deal. ' + (err.response?.data?.error || ''))
        }
    }

    const handleEdit = (deal) => {
        setEditingDeal(deal)
        setFormData({
            name: deal.name,
            description: deal.description || '',
            imageUrl: deal.imageUrl || '',
            category: deal.category || 'Lunch Combo',
            comboPrice: deal.comboPrice,
            minWeeklySpend: deal.minWeeklySpend || 5000,
            active: deal.active
        })
        setSelectedItems(deal.items.map(i => ({
            menuItemId: i.menuItemId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            imageUrl: i.imageUrl
        })))
        setShowForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this combo deal?')) return
        try {
            await comboDealService.deleteComboDeal(id, canteenOwner.canteenId)
            setSuccess('Combo deal deleted successfully!')
            fetchData(canteenOwner.canteenId)
        } catch (err) {
            setError('Failed to delete combo deal.')
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            imageUrl: '',
            category: 'Lunch Combo',
            comboPrice: '',
            minWeeklySpend: '5000',
            active: true
        })
        setSelectedItems([])
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    return (
        <CanteenLayout pageTitle="Combo Deals" pageSubtitle="Create combo deals to attract more customers with bundle discounts">
            <div className="flex justify-end mb-8">
                <button
                    onClick={() => {
                        setShowForm(!showForm)
                        if (showForm) {
                            setEditingDeal(null)
                            resetForm()
                        }
                    }}
                    className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-1 ${showForm ? 'bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.2)]' : 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-[0_4px_14px_0_rgba(249,115,22,0.39)]'
                        }`}
                >
                    {showForm ? 'Cancel' : '+ Create Combo Deal'}
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

            {/* Create/Edit Form */}
            {showForm && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="rounded-2xl shadow-2xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }}></span>
                        {editingDeal ? 'Edit Combo Deal' : 'Create New Combo Deal'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Combo Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    className="w-full px-4 py-2.5 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder-gray-600"
                                    placeholder="e.g. Lunch Special Combo"
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
                                    {COMBO_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    className="w-full px-4 py-2.5 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none h-20 transition-all resize-none placeholder-gray-600"
                                    placeholder="Describe what makes this combo special"
                                />
                            </div>
                        </div>

                        {/* Select Menu Items */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span className="text-orange-500">🍽️</span> Select Items for Combo
                                <span className="text-sm font-normal text-gray-500">(min. 2 items)</span>
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {menuItems.filter(i => i.available).map(item => {
                                    const isSelected = selectedItems.some(s => s.menuItemId === item.id)
                                    const selectedItem = selectedItems.find(s => s.menuItemId === item.id)
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleItemSelection(item)}
                                            className={`cursor-pointer rounded-xl p-3 transition-all border ${isSelected
                                                ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                                                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20'
                                                }`}
                                        >
                                            {item.imageUrl && (
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                                            )}
                                            <p className={`text-sm font-bold truncate ${isSelected ? 'text-orange-400' : 'text-white'}`}>{item.name}</p>
                                            <p className="text-xs text-gray-500">Rs. {item.price}</p>
                                            {isSelected && (
                                                <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
                                                    <button type="button" onClick={() => updateItemQuantity(item.id, (selectedItem?.quantity || 1) - 1)} className="w-6 h-6 rounded bg-white/10 text-white text-sm flex items-center justify-center hover:bg-white/20">−</button>
                                                    <span className="text-sm text-white font-bold">{selectedItem?.quantity || 1}</span>
                                                    <button type="button" onClick={() => updateItemQuantity(item.id, (selectedItem?.quantity || 1) + 1)} className="w-6 h-6 rounded bg-white/10 text-white text-sm flex items-center justify-center hover:bg-white/20">+</button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Pricing */}
                        {selectedItems.length >= 2 && (
                            <div style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.15)' }} className="rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-orange-500">💰</span> Pricing
                                </h3>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Original Total</p>
                                        <p className="text-2xl font-black text-white">Rs. {originalTotal.toFixed(0)}</p>
                                        <p className="text-xs text-gray-500">{selectedItems.length} items selected</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Combo Price (Rs.) *</label>
                                        <input
                                            type="number"
                                            name="comboPrice"
                                            required
                                            value={formData.comboPrice}
                                            onChange={handleInputChange}
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                            className="w-full px-4 py-2.5 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder-gray-600"
                                            placeholder="Set combo price"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Customer Savings</p>
                                        {savings > 0 ? (
                                            <>
                                                <p className="text-2xl font-black text-green-400">Rs. {savings.toFixed(0)} off</p>
                                                <p className="text-xs text-green-400/70">{discountPercent}% discount</p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-red-400">Set a lower combo price</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recommendation Settings */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span className="text-orange-500">🎯</span> Recommendation Settings
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Min. Weekly Spend for Recommendation (Rs.)</label>
                                    <input
                                        type="number"
                                        name="minWeeklySpend"
                                        value={formData.minWeeklySpend}
                                        onChange={handleInputChange}
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                        className="w-full px-4 py-2.5 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder-gray-600"
                                        placeholder="5000"
                                    />
                                    <p className="text-xs text-gray-600 mt-1">Users spending this much per week at your canteen will see this combo as recommended</p>
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                name="active"
                                                checked={formData.active}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 appearance-none border-2 border-[rgba(255,255,255,0.2)] rounded bg-transparent checked:bg-orange-500 checked:border-orange-500 transition-colors"
                                            />
                                            <svg className={`absolute w-3 h-3 text-white pointer-events-none left-1 top-1 transition-opacity ${formData.active ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Active (Visible to customers)</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-[rgba(255,255,255,0.05)]">
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setEditingDeal(null); resetForm() }}
                                className="px-6 py-2.5 bg-[rgba(255,255,255,0.05)] text-gray-300 rounded-lg hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-500 hover:to-red-500 font-bold shadow-lg disabled:opacity-50 transition"
                            >
                                {editingDeal ? 'Update Combo Deal' : 'Create Combo Deal'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Combo Deals List */}
            {comboDeals.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="rounded-2xl shadow-xl p-16 text-center mt-8">
                    <div className="text-6xl mb-6 opacity-50">🎁</div>
                    <h2 className="text-2xl font-bold text-white mb-2">No combo deals yet</h2>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">Create combo deals to offer bundle discounts. Combos are recommended to frequent customers based on their spending patterns.</p>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-8 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] transform hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)] transition"
                        >
                            + Create Your First Combo
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {comboDeals.map(deal => (
                        <div key={deal.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} className="rounded-2xl overflow-hidden group hover:bg-[rgba(255,255,255,0.04)] transition duration-300">
                            {/* Header with discount badge */}
                            <div className="relative p-5 pb-0">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${deal.active ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
                                        {deal.active ? '● Active' : '● Inactive'}
                                    </span>
                                    {deal.discountPercent > 0 && (
                                        <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                                            {deal.discountPercent}% OFF
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-black text-white mb-1">{deal.name}</h3>
                                <p className="text-xs text-gray-500 mb-2">{deal.category}</p>
                                {deal.description && <p className="text-sm text-gray-400 line-clamp-2 mb-4">{deal.description}</p>}
                            </div>

                            {/* Items list */}
                            <div className="px-5 py-3">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Includes:</p>
                                <div className="space-y-1.5">
                                    {deal.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-300">{item.quantity}x {item.name}</span>
                                            <span className="text-gray-500">Rs. {item.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="px-5 py-4 border-t border-white/[0.05]">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-gray-500 line-through">Rs. {deal.originalPrice}</span>
                                    <span className="text-2xl font-black text-orange-400">Rs. {deal.comboPrice}</span>
                                </div>
                                <p className="text-xs text-gray-600">
                                    🎯 Recommended for users spending ≥ Rs. {deal.minWeeklySpend}/week
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 px-5 py-3 border-t border-[rgba(255,255,255,0.05)]">
                                <button
                                    onClick={() => handleEdit(deal)}
                                    className="p-2 text-blue-400 hover:text-white hover:bg-blue-500/20 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(deal.id)}
                                    className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CanteenLayout>
    )
}

export default ComboManagement
