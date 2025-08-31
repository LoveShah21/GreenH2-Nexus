"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Key,
  Monitor,
  Sun,
  Moon,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FadeIn } from "@/components/animations/FadeIn";
import { useThemeStore } from "@/lib/stores/themeStore";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    role: "",
    phone: "",
  });

  // Load user profile from auth context
  useEffect(() => {
    if (user && isAuthenticated) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        organization: user.organization || "",
        role: user.role || "",
        phone: user.phone || "", // Phone field for frontend use
      });
    }
  }, [user, isAuthenticated]);

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    projectUpdates: true,
    systemAlerts: true,
  });

  const [dataSettings, setDataSettings] = useState({
    dataRetention: "1year",
    autoBackup: true,
    shareAnalytics: false,
  });

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "security", name: "Security", icon: Shield },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "appearance", name: "Appearance", icon: Palette },
    { id: "data", name: "Data & Privacy", icon: Database },
  ];

  const handleSave = async () => {
    setSaveStatus("saving");
    setError("");
    setIsLoading(true);

    try {
      if (activeTab === "profile") {
        // Update profile
        await authApi.updateProfile({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          organization: profileData.organization,
        });
      } else if (activeTab === "security") {
        // Change password
        if (securityData.newPassword && securityData.currentPassword) {
          if (securityData.newPassword !== securityData.confirmPassword) {
            throw new Error("New passwords do not match");
          }
          await authApi.changePassword({
            currentPassword: securityData.currentPassword,
            newPassword: securityData.newPassword,
          });
          // Clear password fields after successful change
          setSecurityData((prev) => ({
            ...prev,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }));
        }
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error: any) {
      console.error("Save failed:", error);
      setError(error.message || "Failed to save settings. Please try again.");
      setSaveStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    section: string,
    field: string,
    value: string | boolean
  ) => {
    if (section === "profile") {
      setProfileData((prev) => ({ ...prev, [field]: value }));
    } else if (section === "security") {
      setSecurityData((prev) => ({ ...prev, [field]: value }));
    } else if (section === "notifications") {
      setNotificationSettings((prev) => ({ ...prev, [field]: value }));
    } else if (section === "data") {
      setDataSettings((prev) => ({ ...prev, [field]: value }));
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </label>
            <Input
              value={profileData.firstName}
              onChange={(e) =>
                handleInputChange("profile", "firstName", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </label>
            <Input
              value={profileData.lastName}
              onChange={(e) =>
                handleInputChange("profile", "lastName", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={profileData.email}
              onChange={(e) =>
                handleInputChange("profile", "email", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone
            </label>
            <Input
              type="tel"
              value={profileData.phone}
              onChange={(e) =>
                handleInputChange("profile", "phone", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organization
            </label>
            <Input
              value={profileData.organization}
              onChange={(e) =>
                handleInputChange("profile", "organization", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <Input
              value={profileData.role}
              onChange={(e) =>
                handleInputChange("profile", "role", e.target.value)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Change Password
        </h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={securityData.currentPassword}
                onChange={(e) =>
                  handleInputChange(
                    "security",
                    "currentPassword",
                    e.target.value
                  )
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              value={securityData.newPassword}
              onChange={(e) =>
                handleInputChange("security", "newPassword", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              value={securityData.confirmPassword}
              onChange={(e) =>
                handleInputChange("security", "confirmPassword", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Two-Factor Authentication
        </h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Two-Factor Authentication
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={securityData.twoFactorEnabled}
              onChange={(e) =>
                handleInputChange(
                  "security",
                  "twoFactorEnabled",
                  e.target.checked
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notification Preferences
        </h3>
        <div className="space-y-4">
          {Object.entries(notificationSettings).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {key === "emailNotifications" &&
                    "Receive notifications via email"}
                  {key === "pushNotifications" &&
                    "Receive push notifications in your browser"}
                  {key === "weeklyReports" && "Get weekly summary reports"}
                  {key === "projectUpdates" &&
                    "Notifications about project status changes"}
                  {key === "systemAlerts" &&
                    "Important system maintenance and alerts"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    handleInputChange("notifications", key, e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Theme Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {}}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              theme === "light"
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                Light Mode
              </span>
            </div>
            <div className="w-full h-16 bg-white border border-gray-200 rounded-md flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-100 rounded"></div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {}}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              theme === "dark"
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Moon className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                Dark Mode
              </span>
            </div>
            <div className="w-full h-16 bg-gray-800 border border-gray-700 rounded-md flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-700 rounded"></div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {}}
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Monitor className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">
                System
              </span>
            </div>
            <div className="w-full h-16 bg-gradient-to-r from-white to-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"></div>
          </motion.div>
        </div>

        <div className="mt-6">
          <Button onClick={toggleTheme} className="flex items-center space-x-2">
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
            <span>Switch to {theme === "light" ? "Dark" : "Light"} Mode</span>
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Management
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Data Retention
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                How long to keep your project data
              </p>
            </div>
            <select
              value={dataSettings.dataRetention}
              onChange={(e) =>
                handleInputChange("data", "dataRetention", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="6months">6 Months</option>
              <option value="1year">1 Year</option>
              <option value="2years">2 Years</option>
              <option value="indefinite">Indefinite</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Automatic Backup
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Automatically backup your data weekly
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dataSettings.autoBackup}
                onChange={(e) =>
                  handleInputChange("data", "autoBackup", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Share Analytics
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Help improve our platform by sharing anonymous usage data
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dataSettings.shareAnalytics}
                onChange={(e) =>
                  handleInputChange("data", "shareAnalytics", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Data Export & Import
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import Data</span>
          </Button>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h3>
        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <Trash2 className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-800 dark:text-red-300">
                Delete Account
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
              <Button
                variant="outline"
                className="mt-3 text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your account preferences and application settings
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <FadeIn delay={0.1}>
            <Card className="p-4 h-fit">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </FadeIn>

          {/* Content */}
          <div className="lg:col-span-3">
            <FadeIn delay={0.2}>
              <Card className="p-6">
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {activeTab === "profile" && renderProfileTab()}
                {activeTab === "security" && renderSecurityTab()}
                {activeTab === "notifications" && renderNotificationsTab()}
                {activeTab === "appearance" && renderAppearanceTab()}
                {activeTab === "data" && renderDataTab()}

                {/* Save Button */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    {saveStatus === "saved" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center space-x-2 text-green-600 dark:text-green-400"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">
                          Settings saved successfully
                        </span>
                      </motion.div>
                    )}
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={saveStatus === "saving"}
                    className="flex items-center space-x-2"
                  >
                    {saveStatus === "saving" ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
