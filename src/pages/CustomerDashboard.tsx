import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, ArrowLeft, Bell, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const customerName = location.state?.customerName || "Guest";
  
  const [appeals, setAppeals] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppeals();
    fetchNotifications();
  }, []);

  const fetchAppeals = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('appeals')
        .select(`
          *,
          loan_applications (
            id,
            loan_amount,
            prediction
          )
        `)
        .eq('user_id', customerName)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppeals(data || []);
    } catch (error: any) {
      console.error('Error fetching appeals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', customerName)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      
      toast({
        title: "Notification marked as read",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">FairFinance</span>
            </div>
          </div>
          <div className="relative">
            <Bell className="h-6 w-6 text-foreground" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">Welcome, {customerName}</h1>
            <p className="text-lg text-muted-foreground">
              Track your appeals and stay updated with notifications
            </p>
          </div>

          {/* Appeal Status Section */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Appeal Status</h2>
            {loading ? (
              <p className="text-muted-foreground">Loading appeals...</p>
            ) : appeals.length === 0 ? (
              <p className="text-muted-foreground">No appeals submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {appeals.map((appeal) => (
                  <Card key={appeal.id} className="p-4 bg-secondary/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          Loan ID: {appeal.loan_id.slice(0, 8)}...
                        </span>
                        {appeal.status === 'pending' ? (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending Review
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Reviewed
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(appeal.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {appeal.status === 'reviewed' && appeal.review_comment && (
                      <div className="mt-3 p-3 bg-card rounded-md">
                        <p className="text-sm font-medium text-foreground mb-1">Employee Review:</p>
                        <p className="text-sm text-muted-foreground">{appeal.review_comment}</p>
                        {appeal.final_decision && (
                          <p className="text-sm mt-2">
                            <span className="font-medium text-foreground">Decision: </span>
                            <span className={appeal.final_decision === 'approved_after_review' ? 'text-green-500' : 'text-red-500'}>
                              {appeal.final_decision === 'approved_after_review' ? 'Approved' : 'Rejected'}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Notifications Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
              <Badge variant="outline">{unreadCount} Unread</Badge>
            </div>
            {notifications.length === 0 ? (
              <p className="text-muted-foreground">No notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`p-4 ${notification.read ? 'bg-secondary/10' : 'bg-primary/5 border-primary/20'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-foreground mb-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;