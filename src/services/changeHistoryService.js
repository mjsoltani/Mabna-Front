import API_BASE_URL from '../config';

class ChangeHistoryService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get authentication headers
   * @private
   */
  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  /**
   * Build query string from filters
   * @private
   */
  buildQueryString(filters) {
    if (!filters) return '';
    
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Fetch change history for a specific entity
   * @param {string} entityType - Entity type (task, objective, etc.)
   * @param {string} entityId - Entity ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>}
   */
  async getEntityHistory(entityType, entityId, filters = {}) {
    try {
      const queryString = this.buildQueryString(filters);
      const response = await fetch(
        `${this.baseURL}/api/change-history/${entityType}/${entityId}${queryString}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'خطا در دریافت تاریخچه');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching entity history:', error);
      throw error;
    }
  }

  /**
   * Fetch all change history (admin only)
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>}
   */
  async getAllHistory(filters = {}) {
    try {
      const queryString = this.buildQueryString(filters);
      const response = await fetch(
        `${this.baseURL}/api/change-history${queryString}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'خطا در دریافت تاریخچه');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all history:', error);
      throw error;
    }
  }

  /**
   * Fetch change statistics (admin only)
   * @param {string} startDate - Optional start date (ISO 8601)
   * @param {string} endDate - Optional end date (ISO 8601)
   * @returns {Promise<Object>}
   */
  async getStats(startDate, endDate) {
    try {
      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      const queryString = this.buildQueryString(filters);
      const response = await fetch(
        `${this.baseURL}/api/change-history/stats/summary${queryString}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'خطا در دریافت آمار');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
}

export default new ChangeHistoryService();
