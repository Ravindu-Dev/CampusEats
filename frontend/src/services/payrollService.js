import axios from 'axios'

const API_URL = '/api/payroll'

const getAuthHeaders = () => {
    // Try canteen owner token first, then admin token
    const canteenOwner = JSON.parse(localStorage.getItem('canteenOwner'))
    if (canteenOwner?.token) {
        return { Authorization: `Bearer ${canteenOwner.token}` }
    }
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
        return { Authorization: `Bearer ${adminToken}` }
    }
    return {}
}

const payrollService = {
    // Config
    getConfig: async () => {
        const response = await axios.get(`${API_URL}/config`, { headers: getAuthHeaders() })
        return response.data
    },

    updateConfig: async (configData, adminId) => {
        const response = await axios.put(`${API_URL}/config?adminId=${adminId || ''}`, configData, { headers: getAuthHeaders() })
        return response.data
    },

    // Payroll CRUD
    generatePayroll: async (data) => {
        const response = await axios.post(`${API_URL}/generate`, data, { headers: getAuthHeaders() })
        return response.data
    },

    getPayrollById: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders() })
        return response.data
    },

    getPayrollsByCanteen: async (canteenId) => {
        const response = await axios.get(`${API_URL}/canteen/${canteenId}`, { headers: getAuthHeaders() })
        return response.data
    },

    getPendingPayrolls: async () => {
        const response = await axios.get(`${API_URL}/pending`, { headers: getAuthHeaders() })
        return response.data
    },

    getPendingCount: async () => {
        const response = await axios.get(`${API_URL}/pending/count`, { headers: getAuthHeaders() })
        return response.data
    },

    getAllPayrolls: async () => {
        const response = await axios.get(`${API_URL}/all`, { headers: getAuthHeaders() })
        return response.data
    },

    // Workflow
    submitPayroll: async (id, submittedBy, actionData) => {
        const response = await axios.put(`${API_URL}/${id}/submit?submittedBy=${submittedBy || ''}`, actionData || {}, { headers: getAuthHeaders() })
        return response.data
    },

    approvePayroll: async (id, reviewedBy, actionData) => {
        const response = await axios.put(`${API_URL}/${id}/approve?reviewedBy=${reviewedBy || ''}`, actionData || {}, { headers: getAuthHeaders() })
        return response.data
    },

    rejectPayroll: async (id, reviewedBy, actionData) => {
        const response = await axios.put(`${API_URL}/${id}/reject?reviewedBy=${reviewedBy || ''}`, actionData || {}, { headers: getAuthHeaders() })
        return response.data
    },

    // PDF Download
    downloadPayslip: async (payrollId, staffId) => {
        const response = await axios.get(`${API_URL}/${payrollId}/payslip/${staffId}/pdf`, {
            headers: getAuthHeaders(),
            responseType: 'blob'
        })
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `payslip_${staffId}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    }
}

export default payrollService
