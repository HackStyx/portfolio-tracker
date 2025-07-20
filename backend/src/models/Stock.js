const supabase = require('../config/supabase');

const Stock = {
  async findAll(options = {}) {
    let query = supabase.from('stocks').select('*');
    
    if (options.where) {
      // Handle where clauses
      Object.entries(options.where).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Handle operators like Op.gt
          if (value.hasOwnProperty('gt')) {
            query = query.gt(key, value.gt);
          } else if (value.hasOwnProperty('lt')) {
            query = query.lt(key, value.lt);
          }
          // Add more operators as needed
        } else {
          // Simple equality
          query = query.eq(key, value);
        }
      });
    }

    if (options.order) {
      // Handle order clauses - Supabase uses orderBy instead of order
      options.order.forEach(([column, direction]) => {
        query = query.order(column, { ascending: direction === 'ASC' });
      });
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async findByPk(id) {
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data ? {
      ...data,
      update: async (values) => {
        const { data: updatedData, error: updateError } = await supabase
          .from('stocks')
          .update(values)
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        return updatedData;
      },
      destroy: async () => {
        const { error: deleteError } = await supabase
          .from('stocks')
          .delete()
          .eq('id', id);
        
        if (deleteError) throw deleteError;
        return true;
      }
    } : null;
  },

  async create(values) {
    const { data, error } = await supabase
      .from('stocks')
      .insert([values])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async count() {
    const { count, error } = await supabase
      .from('stocks')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  }
};

module.exports = Stock; 