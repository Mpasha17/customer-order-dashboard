import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import axios from 'axios';

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        // Fetch customer details with order statistics
        const customerResponse = await axios.get(`/api/customers/${id}`);
        setCustomer(customerResponse.data);

        // Fetch customer orders
        const ordersResponse = await axios.get(`/api/customers/${id}/orders`);
        setOrders(ordersResponse.data.orders || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customer data:', error);
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <Badge bg="success">Delivered</Badge>;
      case 'shipped':
        return <Badge bg="info">Shipped</Badge>;
      case 'processing':
        return <Badge bg="warning">Processing</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return <div>Loading customer details...</div>;
  }

  if (!customer) {
    return (
      <Card className="text-center">
        <Card.Body>
          <Card.Title>Customer Not Found</Card.Title>
          <Card.Text>The customer you are looking for does not exist.</Card.Text>
          <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Link to="/" className="btn btn-light mb-3">
        &larr; Back to Dashboard
      </Link>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Customer Details</Card.Title>
              <Row>
                <Col md={6}>
                  <p><strong>Name:</strong> {customer.first_name} {customer.last_name}</p>
                  <p><strong>Email:</strong> {customer.email}</p>
                  <p><strong>Age:</strong> {customer.age}</p>
                  <p><strong>Gender:</strong> {customer.gender}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Address:</strong> {customer.street_address}</p>
                  <p><strong>Location:</strong> {customer.city}, {customer.state} {customer.postal_code}</p>
                  <p><strong>Country:</strong> {customer.country}</p>
                  <p><strong>Joined:</strong> {new Date(customer.created_at).toLocaleDateString()}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Order Statistics</Card.Title>
              <Row>
                <Col xs={6} md={3} className="text-center mb-3">
                  <h3>{customer.order_statistics?.total_orders || 0}</h3>
                  <p>Total Orders</p>
                </Col>
                <Col xs={6} md={3} className="text-center mb-3">
                  <h3>{customer.order_statistics?.completed_orders || 0}</h3>
                  <p>Completed</p>
                </Col>
                <Col xs={6} md={3} className="text-center mb-3">
                  <h3>{customer.order_statistics?.shipped_orders || 0}</h3>
                  <p>Shipped</p>
                </Col>
                <Col xs={6} md={3} className="text-center mb-3">
                  <h3>${customer.order_statistics?.total_spent?.toFixed(2) || '0.00'}</h3>
                  <p>Total Spent</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Order History</Card.Title>
              {orders.length === 0 ? (
                <p>This customer has no orders.</p>
              ) : (
                <div>
                  {orders.map((order) => (
                    <Card key={order.order_id} className="mb-3">
                      <Card.Header>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>Order #{order.order_id}</strong> - {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <Row className="mb-2">
                          <Col xs={6} md={3}>
                            <small className="text-muted">Items</small>
                            <p className="mb-0">{order.items_count}</p>
                          </Col>
                          <Col xs={6} md={3}>
                            <small className="text-muted">Total</small>
                            <p className="mb-0">${parseFloat(order.order_total).toFixed(2)}</p>
                          </Col>
                        </Row>
                        
                        {order.items && order.items.length > 0 && (
                          <>
                            <hr />
                            <h6>Order Items</h6>
                            <Table responsive size="sm">
                              <thead>
                                <tr>
                                  <th>Item ID</th>
                                  <th>Price</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items.map((item) => (
                                  <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>${parseFloat(item.sale_price).toFixed(2)}</td>
                                    <td>{getStatusBadge(item.status)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </>
                        )}
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CustomerDetails;