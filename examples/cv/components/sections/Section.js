import React from 'react'
import { Box, Typography, Button } from '@smooth-ui/core-sc'

export default ({ title, children, createHandler }) => (<Box borderTop={1} borderColor="primary" p={3} mb={10}>
  <Box display="flex" alignItems="center" justifyContent="space-between">
    <Typography variant="h5" color="secondary">
      {title}
    </Typography>
    <Box>
      <Button variant="light" mb={1} ml={2} onClick={createHandler}>+</Button>
    </Box>
  </Box>
  {children}
</Box>)
