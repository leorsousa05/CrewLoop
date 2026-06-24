import pytest

from obsidian_mcp.config import Config, PrivacyConfig
from obsidian_mcp.privacy.filter import PrivacyFilter


def test_privacy_filter_disabled_via_config():
    config = Config(privacy={"enabled": False})
    f = PrivacyFilter(config)
    assert f.is_safe("API_KEY=secret")
    f.validate("API_KEY=secret")  # no exception


def test_privacy_filter_allow_list_bypass():
    config = Config(privacy={"allowed_strings": ["user@example.com"]})
    f = PrivacyFilter(config)
    assert f.is_safe("Contact user@example.com please")
    f.validate("Contact user@example.com please")


def test_privacy_filter_toggle_emails():
    config = Config(privacy={"block_emails": False})
    f = PrivacyFilter(config)
    assert f.is_safe("user@example.com")


def test_privacy_filter_toggle_credit_cards():
    config = Config(privacy={"block_credit_cards": False})
    f = PrivacyFilter(config)
    assert f.is_safe("1234 5678 9012 3456")


def test_privacy_filter_default_still_blocks():
    f = PrivacyFilter()
    assert not f.is_safe("API_KEY=secret")
    assert not f.is_safe("user@example.com")
    with pytest.raises(ValueError):
        f.validate("API_KEY=secret")


def test_privacy_config_object():
    config = Config(privacy=PrivacyConfig(enabled=False))
    f = PrivacyFilter(config)
    assert f.is_safe("anything")
