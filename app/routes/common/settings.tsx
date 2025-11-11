import React, { useState } from 'react';
import { Camera, Mail, Shield, User, Calendar, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Separator } from '~/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { useUserStore } from '~/hooks/use-user';
import LoadingScreen from '~/components/loading-screen';

export default function AccountSettings() {
  const { user, setUser } = useUserStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForEmail, setPasswordForEmail] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    }
  }, [user])

  if (!user) {
    return <LoadingScreen />
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();

    // Check if email has changed
    if (formData.email !== user.email) {
      setPendingEmail(formData.email);
      setShowPasswordDialog(true);
      return;
    }

    // If only name changed, update directly
    setUser({ ...user, name: formData.name });
    alert("Profile updated successfully!");
  };

  const confirmEmailChange = () => {
    if (!passwordForEmail) {
      alert("Please enter your password");
      return;
    }

    // Here you would verify the password with your backend
    // For demo purposes, we'll just proceed
    setUser({ ...user, name: formData.name, email: pendingEmail });
    setShowPasswordDialog(false);
    setPasswordForEmail("");
    setPendingEmail("");
    alert("Profile updated successfully! Please verify your new email address.");
  };

  const cancelEmailChange = () => {
    setFormData({ ...formData, email: user.email });
    setShowPasswordDialog(false);
    setPasswordForEmail("");
    setPendingEmail("");
  };

  const handlePasswordChange = (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    alert("Password changed successfully!");
    setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: "bg-red-500 hover:bg-red-600",
      manager: "bg-blue-500 hover:bg-blue-600",
      client: "bg-green-500 hover:bg-green-600"
    };
    return colors[role as keyof typeof colors] || "bg-gray-500";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-500 mt-1">Manage your account preferences and security</p>
          </div>
          <Badge className={getRoleBadgeColor(user.role)}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="text-xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user.email}
                {user.email_verified_at && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Change Photo
            </Button>
          </CardHeader>
        </Card>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="account">Account Info</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <div onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                    />
                  </div>
                  <Button onClick={handleProfileUpdate}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Keep your account secure with a strong password</CardDescription>
              </CardHeader>
              <CardContent>
                <div onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button onClick={handlePasswordChange}>Update Password</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>View your account information and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      User ID
                    </div>
                    <p className="font-medium">{user.id}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Shield className="h-4 w-4" />
                      Role
                    </div>
                    <p className="font-medium capitalize">{user.role}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </div>
                    <p className="font-medium">{formatDate(user.created_at)}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle2 className="h-4 w-4" />
                      Email Verified
                    </div>
                    <p className="font-medium">{formatDate(user.email_verified_at)}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle2 className="h-4 w-4" />
                      Approved At
                    </div>
                    <p className="font-medium">{formatDate(user.approved_at)}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Last Updated
                    </div>
                    <p className="font-medium">{formatDate(user.updated_at)}</p>
                  </div>
                  {user.address_id && (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Address ID</div>
                      <p className="font-medium">{user.address_id}</p>
                    </div>
                  )}
                  {user.client_code_id && (
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Client Code ID</div>
                      <p className="font-medium">{user.client_code_id}</p>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Email Change</DialogTitle>
              <DialogDescription>
                You're about to change your email to <span className="font-semibold">{pendingEmail}</span>.
                Please enter your current password to confirm this change.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="passwordConfirm">Current Password</Label>
              <Input
                id="passwordConfirm"
                type="password"
                value={passwordForEmail}
                onChange={(e) => setPasswordForEmail(e.target.value)}
                placeholder="Enter your current password"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmEmailChange();
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={cancelEmailChange}>
                Cancel
              </Button>
              <Button onClick={confirmEmailChange}>
                Confirm Change
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}