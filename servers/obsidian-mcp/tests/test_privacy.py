import pytest

from obsidian_mcp.config import Config
from obsidian_mcp.privacy.filter import PrivacyFilter


def test_blocks_api_key():
    f = PrivacyFilter()
    assert not f.is_safe("API_KEY=sk-123")
    with pytest.raises(ValueError):
        f.validate("API_KEY=sk-123")


def test_allows_safe_text():
    f = PrivacyFilter()
    assert f.is_safe("This is a normal note about MCP.")


def test_blocks_email():
    f = PrivacyFilter()
    assert not f.is_safe("Contact me at user@example.com")


def test_blocks_secret_key_prefix():
    f = PrivacyFilter()
    assert not f.is_safe("Key: sk-abc123def456ghi789")


def test_allows_tokenization_word():
    f = PrivacyFilter()
    assert f.is_safe("This note discusses tokenization of text.")
