const ORDERS_KEY = 'sanitaryware_orders';

export const getOrders = () => {
    const orders = localStorage.getItem(ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
};

export const saveOrder = (order) => {
    const orders = getOrders();
    // Add status history/tracking steps
    const orderWithTracking = {
        ...order,
        statusHistory: [
            { status: 'pending', label: 'Order Placed', date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), completed: true },
            { status: 'confirmed', label: 'Confirmed', date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), completed: false },
            { status: 'shipped', label: 'Shipped', date: '', completed: false },
            { status: 'out_for_delivery', label: 'Out for Delivery', date: '', completed: false },
            { status: 'delivered', label: 'Delivered', date: '', completed: false },
        ]
    };
    localStorage.setItem(ORDERS_KEY, JSON.stringify([orderWithTracking, ...orders]));
    return orderWithTracking;
};

export const updateOrderStatus = (orderId, newStatus) => {
    const orders = getOrders();
    const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
            const newHistory = order.statusHistory.map(step => {
                // Logically complete steps up to the new status
                const statusMap = ['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];
                const targetIndex = statusMap.indexOf(newStatus);
                const currentIndex = statusMap.indexOf(step.status);

                if (currentIndex <= targetIndex) {
                    return {
                        ...step,
                        completed: true,
                        date: step.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                    };
                }
                return step;
            });

            return { ...order, status: newStatus, statusHistory: newHistory };
        }
        return order;
    });
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
};
