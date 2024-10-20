// handler.js

// Sample order data with more entries
const orders = [
    { id: 1, items: [{ id: 1, name: 'Product 1', quantity: 2 }, { id: 2, name: 'Product 2', quantity: 1 }], total: 59.99 },
    { id: 2, items: [{ id: 3, name: 'Product 3', quantity: 3 }], total: 89.97 },
    { id: 3, items: [{ id: 4, name: 'Product 4', quantity: 1 }, { id: 5, name: 'Product 5', quantity: 2 }], total: 124.98 },
    { id: 4, items: [{ id: 6, name: 'Product 6', quantity: 5 }], total: 199.95 },
    { id: 5, items: [{ id: 7, name: 'Product 7', quantity: 1 }, { id: 8, name: 'Product 8', quantity: 3 }], total: 149.97 },
    { id: 6, items: [{ id: 9, name: 'Product 9', quantity: 2 }], total: 49.98 },
    { id: 7, items: [{ id: 10, name: 'Product 10', quantity: 1 }, { id: 11, name: 'Product 11', quantity: 4 }], total: 179.96 },
    { id: 8, items: [{ id: 12, name: 'Product 12', quantity: 2 }, { id: 13, name: 'Product 13', quantity: 1 }], total: 89.99 },
    { id: 9, items: [{ id: 14, name: 'Product 14', quantity: 3 }], total: 134.97 },
    { id: 10, items: [{ id: 15, name: 'Product 15', quantity: 1 }, { id: 16, name: 'Product 16', quantity: 2 }], total: 119.98 },
];

// Configuration for chaos experiments
const chaosConfig = {
    enabled: true,  // Enable chaos experiments
    failureRate: 0.8,  // 80% probability of injecting a failure
    failureModes: ['random', 'latency', 'unavailable', 'timeout', 'memoryLeak'],  // Multiple failure modes
};

exports.processOrder = async (event) => {
    try {
        // Extract the order ID from the event
        const { orderId } = event.pathParameters || {};
        console.log(`Processing order with ID: ${orderId}`);

        // Find the order by ID
        const order = orders.find((o) => o.id === parseInt(orderId));

        if (!order) {
            console.log(`Order not found: ${orderId}`);
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Order not found' }),
            };
        }

        // Simulate order processing with chaos engineering
        if (chaosConfig.enabled && Math.random() < chaosConfig.failureRate) {
            const failureMode = chaosConfig.failureModes[Math.floor(Math.random() * chaosConfig.failureModes.length)];
            console.log(`Injecting ${failureMode} error for order: ${orderId}`);

            switch (failureMode) {
                case 'random':
                    throw new Error('Failed to process order');
                case 'latency':
                    // Simulate slow processing
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    break;
                case 'unavailable':
                    throw new Error('Order processing service unavailable');
                case 'timeout':
                    // Simulate timeout error
                    await new Promise((resolve, reject) => setTimeout(() => reject(new Error('Processing timed out')), 3000));
                    break;
                case 'memoryLeak':
                    // Simulate memory leak
                    let memoryLeak = [];
                    while (true) {
                        memoryLeak.push(new Array(1000).fill('*'));
                    }
                default:
                    throw new Error('Invalid chaos failure mode');
            }
        }

        // Successful order processing
        console.log(`Successfully processed order: ${orderId}`);
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Order processed successfully',
                order,
            }),
        };

        return response;
    } catch (error) {
        console.error(`Error processing order ${event.pathParameters ? event.pathParameters.orderId : ''}:`, error.message);

        // Send failure details to a simulated monitoring system
        sendFailureToMonitoring(error, event);

        let errorMessage = 'Internal Server Error';
        if (error.message === 'Failed to process order') {
            errorMessage = 'Random error occurred during order processing';
        } else if (error.message === 'Order processing service unavailable') {
            errorMessage = 'Order processing service is currently unavailable';
        } else if (error.message === 'Processing timed out') {
            errorMessage = 'Order processing timed out';
        } else if (error.message === 'Invalid chaos failure mode') {
            errorMessage = 'Configuration error in chaos experiment';
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: errorMessage,
            }),
        };
    }
};

// Simulate sending failure details to a monitoring system (replace with actual integration)
const sendFailureToMonitoring = (error, event) => {
    const failureData = {
        orderId: event.pathParameters ? event.pathParameters.orderId : null,
        errorMessage: error.message,
        timestamp: Date.now(),
    };
    console.log('Sending failure data to monitoring:', failureData);
    // Replace with actual logic to send data to your monitoring system
};

exports.onFailure = async (event) => {
    console.log('Function failed:', event);
};
