import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Form, InputGroup, Pagination, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    perPage: 10
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        // Include search term in API request if it exists
        const searchParam = searchTerm.trim() ? `&search=${encodeURIComponent(searchTerm.trim())}` : '';
        const response = await axios.get(`/api/customers?page=${pagination.currentPage}&per_page=${pagination.perPage}${searchParam}`);
        setCustomers(response.data.customers);
        setPagination({
          currentPage: response.data.pagination.current_page,
          totalPages: response.data.pagination.total_pages,
          perPage: response.data.pagination.per_page
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setError('Failed to load customers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Use a debounce for search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [pagination.currentPage, pagination.perPage, searchTerm]);

  // We're now using the backend API for search, so no need for client-side filtering
  const filteredCustomers = customers;
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setPagination(prev => ({
      ...prev,
      currentPage: pageNumber
    }));
  };
  
  // Generate pagination items
  const paginationItems = [];
  for (let number = 1; number <= pagination.totalPages; number++) {
    // Show only 5 pages around current page for better UX
    if (
      number === 1 || 
      number === pagination.totalPages || 
      (number >= pagination.currentPage - 2 && number <= pagination.currentPage + 2)
    ) {
      paginationItems.push(
        <Pagination.Item 
          key={number} 
          active={number === pagination.currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    } else if (
      number === pagination.currentPage - 3 || 
      number === pagination.currentPage + 3
    ) {
      paginationItems.push(<Pagination.Ellipsis key={`ellipsis-${number}`} />);
    }
  }

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

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Customer List</Card.Title>
              {loading ? (
                <div className="text-center py-4">
                  <p>Loading customers...</p>
                </div>
              ) : (
                <>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Location</th>
                        <th>Orders</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id}>
                          <td>{customer.id}</td>
                          <td>{customer.first_name} {customer.last_name}</td>
                          <td>{customer.email}</td>
                          <td>
                            {customer.city}{customer.city && customer.state ? ', ' : ''}
                            {customer.state}
                          </td>
                          <td>{customer.order_count}</td>
                          <td>
                            <Link to={`/customer/${customer.id}`} className="btn btn-sm btn-primary">
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  
                  {filteredCustomers.length === 0 && (
                    <p className="text-center">No customers found matching your search criteria.</p>
                  )}
                  
                  {pagination.totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Pagination>
                        <Pagination.First 
                          onClick={() => handlePageChange(1)} 
                          disabled={pagination.currentPage === 1}
                        />
                        <Pagination.Prev 
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1}
                        />
                        
                        {paginationItems}
                        
                        <Pagination.Next 
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.totalPages}
                        />
                        <Pagination.Last 
                          onClick={() => handlePageChange(pagination.totalPages)}
                          disabled={pagination.currentPage === pagination.totalPages}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;