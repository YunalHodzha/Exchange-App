export const fetchData = (url, options = {}) => {
    return fetch(url, options).then(response => response.json());
};

export const loadData = () => fetchData('/api/load-data');

export const getPrice = (currency, operation) => fetchData(`/api/get-price?currency=${currency}&operation=${operation}`);

export const handleOperation = (operationData) => fetchData('/api/handle-operation', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(operationData)
});

export const getDailyReport = () => fetchData('/api/daily-report');
