import pytest

def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "testpassword", "role": "EXPERT"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_login_user(client):
    # First, register the user (handled in session/db fixture or manually here)
    # Since we use an isolated session, we register again or assume it exists
    client.post(
        "/api/v1/auth/register",
        json={"email": "login@example.com", "password": "loginpassword", "role": "SME"},
    )
    
    # Try logging in
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "login@example.com", "password": "loginpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_incorrect_password(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "login@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "Incorrect email or password" in data["message"]
