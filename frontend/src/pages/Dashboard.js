import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.city.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <h1 className="mb-4">Customer Dashboard</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Search Customers</Card.Title>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Search by name, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Customer List</Card.Title>
              {loading ? (
                <p>Loading customers...</p>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>City</th>
                      <th>State</th>
                      <th>Registration Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id}>
                        <td>{user.user_id}</td>
                        <td>{user.first_name} {user.last_name}</td>
                        <td>{user.email}</td>
                        <td>{user.city}</td>
                        <td>{user.state}</td>
                        <td>{user.registration_date}</td>
                        <td>
                          <Link to={`/customer/${user.user_id}`} className="btn btn-sm btn-primary">
                            View Orders
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              {!loading && filteredUsers.length === 0 && (
                <p className="text-center">No customers found matching your search criteria.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;