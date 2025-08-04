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
        // Fetch customer details
        const customerResponse = await axios.get(`/api/users`);
        const customerData = customerResponse.data.find(user => user.user_id === parseInt(id));
        setCustomer(customerData);

        // Fetch customer orders
        const ordersResponse = await axios.get(`/api/users/${id}/orders`);
        setOrders(ordersResponse.data);
        
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
                  <p><strong>Phone:</strong> {customer.phone}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Address:</strong> {customer.address}</p>
                  <p><strong>City:</strong> {customer.city}, {customer.state} {customer.zip_code}</p>
                  <p><strong>Registration Date:</strong> {customer.registration_date}</p>
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
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.order_id}>
                        <td>{order.order_id}</td>
                        <td>{order.order_date}</td>
                        <td>{order.product_name}</td>
                        <td>{order.product_category}</td>
                        <td>{order.quantity}</td>
                        <td>${parseFloat(order.price).toFixed(2)}</td>
                        <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                        <td>{getStatusBadge(order.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="6" className="text-end"><strong>Total Spent:</strong></td>
                      <td colSpan="2">
                        <strong>
                          ${orders.reduce((total, order) => total + parseFloat(order.total_amount), 0).toFixed(2)}
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CustomerDetails;