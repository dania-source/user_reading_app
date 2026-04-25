import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, TextField, Button, Avatar, Box, Grid } from '@mui/material';
import axios from 'axios';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:8000/api/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data.data);
      setStats(response.data.stats);
      setLoading(false);
    } catch (error) {
      alert("حدث خطأ أثناء جلب البيانات");
    }
  };

  if (loading) return <Typography>جاري التحميل...</Typography>;

  return (
    <Container sx={{ mt: 10 }}>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Box textAlign="center" mb={4}>
          <Avatar 
            src={userData.profile_img} 
            sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }} 
          />
          <Typography variant="h5">{userData.name}</Typography>
          <Typography color="textSecondary">{userData.nickname}</Typography>
        </Box>

        {/* عرض الإحصائيات التي برمجتها في Laravel */}
        <Grid container spacing={2} sx={{ mb: 4 }} textAlign="center">
          <Grid item xs={4}>
            <Typography variant="h6">{stats.reading_now_count}</Typography>
            <Typography variant="body2">أقرأ حالياً</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h6">{stats.want_to_read_count}</Typography>
            <Typography variant="body2">أرغب بالقراءة</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h6">{stats.finished_count}</Typography>
            <Typography variant="body2">تمت قراءتها</Typography>
          </Grid>
        </Grid>

        {/* نموذج التحديث */}
        <form>
           <TextField fullWidth label="الاسم" defaultValue={userData.name} margin="normal" />
           <TextField fullWidth label="البريد الإلكتروني" defaultValue={userData.email} margin="normal" />
           {/* أضف باقي الحقول هنا */}
           <Button variant="contained" sx={{ mt: 2, bgcolor: '#1976d2' }}>
             تحديث البيانات
           </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ProfilePage;