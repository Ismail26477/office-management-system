import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Building,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="bg-card rounded-xl border border-border/50 shadow-sm">
            <div className="p-6 border-b border-border/50">
              <h3 className="font-semibold text-lg">Profile Information</h3>
              <p className="text-sm text-muted-foreground">Update your personal details</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face" />
                    <AvatarFallback className="text-2xl">JD</AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h4 className="font-medium">Profile Photo</h4>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm">Upload</Button>
                    <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Personal Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" defaultValue="john.doe@vedaai.com" className="pl-9" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" defaultValue="+1 (555) 123-4567" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="location" defaultValue="New York, USA" className="pl-9" />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="department" defaultValue="Administration" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="admin">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border/50 flex justify-end">
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="bg-card rounded-xl border border-border/50 shadow-sm">
            <div className="p-6 border-b border-border/50">
              <h3 className="font-semibold text-lg">Notification Preferences</h3>
              <p className="text-sm text-muted-foreground">Manage how you receive notifications</p>
            </div>
            <div className="p-6 space-y-6">
              {[
                { label: "Email Notifications", description: "Receive notifications via email" },
                { label: "Push Notifications", description: "Receive push notifications on your device" },
                { label: "Task Reminders", description: "Get reminded about upcoming tasks" },
                { label: "Project Updates", description: "Receive updates about project changes" },
                { label: "Team Messages", description: "Notifications for new team messages" },
                { label: "Leave Approvals", description: "Get notified when leave requests are processed" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked={index < 4} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="bg-card rounded-xl border border-border/50 shadow-sm">
            <div className="p-6 border-b border-border/50">
              <h3 className="font-semibold text-lg">Password & Security</h3>
              <p className="text-sm text-muted-foreground">Manage your account security</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
              <Button>Update Password</Button>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Login Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified of new logins</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <div className="bg-card rounded-xl border border-border/50 shadow-sm">
            <div className="p-6 border-b border-border/50">
              <h3 className="font-semibold text-lg">Display Preferences</h3>
              <p className="text-sm text-muted-foreground">Customize your experience</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="w-full sm:w-64">
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select defaultValue="est">
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    <SelectItem value="cst">Central Time (CST)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select defaultValue="mdy">
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Compact Mode</p>
                  <p className="text-sm text-muted-foreground">Show more content on screen</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Sidebar Collapsed by Default</p>
                  <p className="text-sm text-muted-foreground">Start with a collapsed sidebar</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
